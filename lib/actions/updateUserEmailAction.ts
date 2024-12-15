"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "../mongoose/auth";
import { updateUserEmail } from "../updateUserEmail";

export async function updateUserEmailAction(
	currentState: string,
	formData: FormData
): Promise<string> {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return `Please sign in to submit an email.`;
	}

	const formEmail = formData.get("email");
	if (!formEmail) {
		return `Please submit an email.`;
	}

	const response = await updateUserEmail(user._id, formEmail.toString());
	if (!response.startsWith("Success")) {
		return response;
	}

	revalidatePath("/");
	return `Success!`;
}
