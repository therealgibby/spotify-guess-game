import { getCurrentSession } from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

type RequestJson = {
	device_id: string;
	playlist_uri: string;
};

function sleep(timeMs: number) {
	return new Promise((resolve) => setTimeout(resolve, timeMs));
}

export async function POST(request: NextRequest): Promise<Response> {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return redirect("/");
	}

	try {
		const requestJson: RequestJson = await request.json();
		if (
			typeof requestJson.device_id !== "string" ||
			typeof requestJson.playlist_uri !== "string"
		) {
			return redirect("/");
		}

		// get playlist details
		const playlistDetailsResponse = await fetch(
			`https://api.spotify.com/v1/playlists/${requestJson.playlist_uri}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${session.spotify_access_token}`,
				},
			}
		);

		if (!playlistDetailsResponse.ok) {
			return redirect("/");
		}

		const playlistDetails = await playlistDetailsResponse.json();
		const totalTracks = playlistDetails.tracks.total;
		const trackOffset = Math.floor(Math.random() * totalTracks);

		const playPlaylistResponse = await fetch(
			`https://api.spotify.com/v1/me/player/play?device_id=${requestJson.device_id}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${session.spotify_access_token}`,
					"Content-Type": "application.json",
				},
				body: JSON.stringify({
					context_uri: `spotify:playlist:${requestJson.playlist_uri}`,
					offset: {
						position: trackOffset,
					},
					position_ms: 0,
				}),
			}
		);

		if (!playPlaylistResponse.ok) {
			return redirect("/");
		}

		// bad fix but shuffle can only be enabled after song starts playing
		await sleep(250);

		const enableShuffleResponse = await fetch(
			`https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${requestJson.device_id}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${session.spotify_access_token}`,
				},
			}
		);

		if (!enableShuffleResponse.ok) {
			return redirect("/");
		}

		return new Response(null, { status: 200 });
	} catch (error) {
		console.log(error);
		return redirect("/");
	}
}
