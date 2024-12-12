"use server";

import { getCurrentSession } from "@/lib/mongoose/auth";

export default async function SpotifyPlaylistSubmit() {
	const { user, session } = await getCurrentSession();
	if (!user || !session) {
		return (
			<form
				action={"/api/spotify/playlist/new-game"}
				method="POST"
				className="flex flex-col gap-[32px] mb-[120px]"
			>
				<label
					htmlFor="playlist"
					className="text-[20px] text-center font-semibold"
				>
					Spotify Playlist
				</label>
				<input
					id="playlist"
					name="playlist"
					size={200}
					placeholder="Login to play"
					className="bg-[#242424] w-full block max-w-[360px] px-[16px] py-[12px] rounded-[1.5rem] text-[18px] text-[#ffff] placeholder:text-[#eeeeee80] outline-none"
					disabled
				/>
			</form>
		);
	}

	return (
		<form
			action={"/api/spotify/playlist/new-game"}
			method="POST"
			className="flex flex-col gap-[32px] mb-[120px]"
		>
			<label
				htmlFor="playlist"
				className="text-[20px] text-center font-semibold"
			>
				Spotify Playlist
			</label>
			<input
				id="playlist"
				name="playlist"
				size={200}
				placeholder="Enter playlist link"
				className="bg-[#242424] w-full block max-w-[360px] px-[16px] py-[12px] rounded-[1.5rem] text-[18px] text-[#ffff] placeholder:text-[#eeeeee80] outline-none"
			/>
		</form>
	);
}
