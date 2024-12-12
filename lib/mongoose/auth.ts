import "server-only";

import connectDb, { ISession, IUser, Session, User } from "./db";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { HydratedDocument } from "mongoose";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { cache } from "react";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export function generateId(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const id = encodeBase32LowerCaseNoPadding(bytes);
	return id;
}

export async function createSession(
	token: string,
	userId: string,
	spotifyAccessToken: string,
	spotifyRefreshToken: string
): Promise<ISession> {
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token))
	);
	const session: HydratedDocument<ISession> = new Session({
		_id: sessionId,
		expires_at: new Date(Date.now() + 1000 * 60 * 60),
		user_id: userId,
		spotify_access_token: spotifyAccessToken,
		spotify_refresh_token: spotifyRefreshToken,
	});
	await session.save();
	return session;
}

export async function validateSessionToken(
	token: string
): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token))
	);

	const result: { user: IUser | null; session: ISession | null } = {
		user: null,
		session: null,
	};
	try {
		const session: ISession | null = await Session.findOne({
			_id: sessionId,
		});
		if (!session) {
			return { user: null, session: null };
		}
		const user: IUser | null = await User.findOne({ _id: session.user_id });
		if (!user) {
			return { user: null, session: null };
		}
		result.user = user;
		result.session = session;
	} catch (error) {
		console.log(error);
		return { user: null, session: null };
	}
	const { user, session } = result;

	if (Date.now() >= session.expires_at.getTime()) {
		await Session.deleteOne({ _id: session._id });
		return { session: null, user: null };
	}

	// if there are 15 days or less are left in the session
	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 30) {
		const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60);
		Session.updateOne(
			{ _id: session._id },
			{ $set: { expires_at: newExpiresAt } }
		);
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	try {
		await Session.deleteOne({ _id: sessionId });
	} catch (error) {
		console.log(error);
	}
}

export type SessionValidationResult =
	| { session: ISession; user: IUser }
	| { session: null; user: null };

export async function setSessionTokenCookie(
	token: string,
	expiresAt: Date
): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("auth_session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/",
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("auth_session", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}

export const getCurrentSession = cache(
	async (): Promise<SessionValidationResult> => {
		const dbConnectMessage = await connectDb();
		if (dbConnectMessage.message) {
			console.log(dbConnectMessage.message);
		}

		const cookieStore = await cookies();
		const token = cookieStore.get("auth_session")?.value ?? null;
		if (token === null) {
			return { session: null, user: null };
		}
		const result = await validateSessionToken(token);
		return result;
	}
);
