import "server-only";

import { cache } from "react";
import { IUser, User } from "./mongoose/db";
import { generateId } from "./mongoose/auth";
import { HydratedDocument } from "mongoose";

// returns new user id
export const createUser = cache(
	async (spotifyId: string, username: string): Promise<string> => {
		if (typeof spotifyId !== "string" || typeof username !== "string") {
			return "";
		}

		try {
			const newUserId = generateId();
			const newUser: HydratedDocument<IUser> = new User({
				_id: newUserId,
				spotify_id: spotifyId,
				username: username,
			});
			await newUser.save();

			return newUserId;
		} catch (error) {
			console.error(error);
			return "";
		}
	}
);
