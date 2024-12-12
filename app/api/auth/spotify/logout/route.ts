import {
	deleteSessionTokenCookie,
	getCurrentSession,
	invalidateSession,
} from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";

export async function POST() {
	const { session } = await getCurrentSession();
	if (!session) {
		return redirect("/forbidden");
	}
	await invalidateSession(session._id);
	await deleteSessionTokenCookie();

	return redirect("/");
}
