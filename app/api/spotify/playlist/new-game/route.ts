import { getCurrentSession } from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return redirect("/");
	}

	const formData = await request.formData();
	const playlistLink = formData.get("playlist");
	if (!playlistLink) {
		return redirect("/");
	}

	return redirect(`/game?playlist=${playlistLink}`);
}
