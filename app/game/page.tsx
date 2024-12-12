"use server";

import { getCurrentSession } from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";

export default async function Game({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return redirect("/");
	}

	const { playlist } = await searchParams;
	if (typeof playlist !== "string") {
		return redirect("/");
	}

	return (
		<div className="grow bg-[#121212] flex items-center justify-center">
			{/* <GameModule
				accessToken={session.spotify_access_token}
				playlistLink={playlist}
			/> */}
		</div>
	);
}
