import "server-only";

import { cache } from "react";
import { User } from "./mongoose/db";

export const updateUserEmail = cache(
	async (userId: string, userEmail: string): Promise<string> => {
		if (typeof userId !== "string" || typeof userEmail !== "string") {
			return "Either one or both variables are not the correct types.";
		}

		try {
			await User.updateOne(
				{ _id: userId },
				{
					$set: {
						email: `${userEmail}`,
					},
				},
				{ upsert: false }
			);

			return `Success updating user ${userId} email`;
		} catch (error) {
			console.error(error);
			return `An error occurred updating user ${userId} email`;
		}
	}
);
