import { createUser } from "@/lib/createUser";
import { getUserBySpotifyId } from "@/lib/getUserFromSpotifyId";
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
} from "@/lib/mongoose/auth";
import { spotify } from "@/lib/oauth/spotify";
import { OAuth2Tokens } from "arctic";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieStore = await cookies();
	const storedState = cookieStore.get("spotify_oauth_state")?.value ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await spotify.validateAuthorizationCode(code);
	} catch (error) {
		console.log(error);
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
	}

	const spotifyUserJson = await fetch("https://api.spotify.com/v1/me", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`,
		},
	})
		.then((response) => {
			if (response.ok) return response.json();
			return response.json().then((json) => Promise.reject(json));
		})
		.catch((error) => {
			console.log(error);
			return null;
		});

	const spotifyUserId = spotifyUserJson.id;
	const spotifyUsername = spotifyUserJson.display_name;

	// TODO: Replace this with your own DB query.
	const existingUser = await getUserBySpotifyId(spotifyUserId);

	if (existingUser !== null) {
		const sessionToken = generateSessionToken();
		const session = await createSession(
			sessionToken,
			existingUser._id,
			tokens.accessToken(),
			tokens.refreshToken()
		);
		await setSessionTokenCookie(sessionToken, session.expires_at);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/",
			},
		});
	}

	// TODO: Replace this with your own DB query.
	const newUserId = await createUser(spotifyUserId, spotifyUsername);

	const sessionToken = generateSessionToken();
	const session = await createSession(
		sessionToken,
		newUserId,
		tokens.accessToken(),
		tokens.refreshToken()
	);
	await setSessionTokenCookie(sessionToken, session.expires_at);
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/",
		},
	});
}
