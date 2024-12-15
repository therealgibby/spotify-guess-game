import "server-only";

import { cache } from "react";
import { User } from "./mongoose/db";

export const updateUserCanSignIn = cache(
	async (userId: string, canSignIn: boolean): Promise<string> => {
		if (typeof userId !== "string" || typeof canSignIn !== "boolean") {
			return "Either one or both variables are not the correct types.";
		}

		try {
			await User.updateOne(
				{ _id: userId },
				{
					$set: {
						can_sign_in: canSignIn,
					},
				},
				{ upsert: false }
			);

			return `Success updating user ${userId} can_sign_in`;
		} catch (error) {
			console.error(error);
			return `An error occurred updating user ${userId} can_sign_in`;
		}
	}
);
