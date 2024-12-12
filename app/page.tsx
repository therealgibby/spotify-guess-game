"use server";

import SpotifyPlaylistSubmit from "@/components/spotifyPlaylistSubmit";

export default async function Home() {
	return (
		<div className="grow bg-[#121212] flex items-center justify-center">
			<SpotifyPlaylistSubmit />
		</div>
	);
}
