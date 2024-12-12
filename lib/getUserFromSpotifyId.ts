import "server-only";

import { cache } from "react";
import { IUser, User } from "./mongoose/db";

export const getUserBySpotifyId = cache(
	async (spotifyId: string): Promise<IUser | null> => {
		if (typeof spotifyId !== "string") {
			return null;
		}

		try {
			return await User.findOne({
				spotify_id: spotifyId,
			});
		} catch (error) {
			console.error(error);
			return null;
		}
	}
);
