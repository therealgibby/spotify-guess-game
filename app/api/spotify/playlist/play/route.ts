import { getCurrentSession } from "@/lib/mongoose/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

type RequestJson = {
	device_id: string;
	access_token: string;
	playlist_uri: string;
};

const sleep = (delay: number) =>
	new Promise((resolve) => setTimeout(resolve, delay));

export async function POST(request: NextRequest): Promise<Response> {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return redirect("/");
	}

	try {
		const requestJson: RequestJson = await request.json();

		// get playlist details
		const playlistDetailsResponse = await fetch(
			`https://api.spotify.com/v1/playlists/${requestJson.playlist_uri}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${requestJson.access_token}`,
				},
			}
		);

		console.log(playlistDetailsResponse.status);

		const playlistDetails = await playlistDetailsResponse.json();
		const totalTracks = playlistDetails.tracks.total;
		const trackOffset = Math.floor(Math.random() * totalTracks);

		const playPlaylistResponse = await fetch(
			`https://api.spotify.com/v1/me/player/play?device_id=${requestJson.device_id}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${requestJson.access_token}`,
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

		console.log(playPlaylistResponse.status);

		const enableShuffleResponse = await fetch(
			`https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${requestJson.device_id}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${requestJson.access_token}`,
				},
			}
		);

		console.log(enableShuffleResponse.status);

		return new Response(null, { status: 200 });
	} catch (error) {
		return new Response(null, { status: 500 });
	}
}
