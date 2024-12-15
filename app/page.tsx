"use server";

import SpotifyPlaylistSubmit from "@/components/spotifyPlaylistSubmit";

export async function generateMetadata() {
	return {
		title: "Song-Guess",
		description: "Paste a Spotify playlist link and guess the song names.",
	};
}

export default async function Home() {
	return (
		<div className="grow bg-[#121212] flex items-center justify-center">
			<SpotifyPlaylistSubmit />
		</div>
	);
}
