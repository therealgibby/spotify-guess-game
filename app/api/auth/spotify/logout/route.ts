import {
	deleteSessionTokenCookie,
	getCurrentSession,
	invalidateSession,
} from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { session } = await getCurrentSession();
	if (!session) {
		return redirect("/forbidden");
	}
	await invalidateSession(session._id);
	await deleteSessionTokenCookie();

	return redirect("/");
}
