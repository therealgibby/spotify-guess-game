"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameView from "./gameView";

interface Props {
	accessToken: string;
	playlistLink: string;
}

export default function GameModule({ accessToken, playlistLink }: Props) {
	const webPlayer = useRef(null);
	const [currentTrack, setCurrentTrack] = useState<WebPlaybackTrack | null>(
		null
	);
	const [showTrackName, setShowTrackName] = useState(false);
	const playlistURI = getPlaylistURI(playlistLink);

	const playNextTrack = useCallback(() => {
		if (webPlayer.current) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			webPlayer.current.nextTrack().then(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			});
		}
	}, []);

	const revealTrackName = useCallback(() => {
		setShowTrackName(true);
	}, []);

	function seekCurrentTrack(track: WebPlaybackTrack) {
		if (webPlayer.current && track) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			webPlayer.current.seek(
				Math.floor(Math.random() * (track.duration_ms - 30000))
			);
		}
	}

	useEffect(() => {
		if (currentTrack) {
			setShowTrackName(false);
			seekCurrentTrack(currentTrack);
		}
	}, [currentTrack]);

	useEffect(() => {
		const spotifyScript = document.createElement("script");
		spotifyScript.setAttribute(
			"src",
			"https://sdk.scdn.co/spotify-player.js"
		);
		document.body.appendChild(spotifyScript);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window.onSpotifyWebPlaybackSDKReady = () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const player = new Spotify.Player({
				name: "Web Playback SDK Quick Start Player",
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				getOAuthToken: (cb) => {
					cb(accessToken);
				},
				volume: 0.05,
			});

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.addListener("ready", ({ device_id }) => {
				console.log("Ready with Device ID", device_id);
				player.getCurrentState().then((state: WebPlaybackState) => {
					if (!state?.track_window) {
						startPlaylist(device_id, playlistURI);
					}
				});
			});

			player.addListener(
				"player_state_changed",
				(state: WebPlaybackState) => {
					if (!state) {
						return;
					}

					if (state.position >= 0 && state.position <= 1000) {
						setCurrentTrack(state.track_window.current_track);
					}
				}
			);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.addListener("not_ready", ({ device_id }) => {
				console.log("Device ID has gone offline", device_id);
			});

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.addListener("initialization_error", ({ message }) => {
				console.error(message);
			});

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.addListener("authentication_error", ({ message }) => {
				console.error(message);
			});

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.addListener("account_error", ({ message }) => {
				console.error(message);
			});

			player.connect();

			webPlayer.current = player;

			// so the cleanup function can access the player
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			window.player = player;
		};

		return () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			window.player.disconnect();
		};
	}, []);

	return (
		<GameView
			trackName={currentTrack?.name ?? ""}
			playNextTrack={playNextTrack}
			albumImageUrl={`${currentTrack?.album.images[0].url}`}
			revealTrackName={revealTrackName}
			showTrackName={showTrackName}
		/>
	);
}

function getPlaylistURI(playlistLink: string) {
	if (playlistLink) {
		const lastIndex = playlistLink.lastIndexOf("/");
		const URI = playlistLink.substring(lastIndex + 1);

		return URI;
	}

	return "";
}

async function startPlaylist(deviceId: string, playlistURI: string) {
	const startPlaylistResponse = await fetch("/api/spotify/playlist/play", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			device_id: `${deviceId}`,
			playlist_uri: `${playlistURI}`,
		}),
	});

	console.log("Status Code: ", startPlaylistResponse);
}

interface WebPlaybackState {
	context: {
		uri: string;
		metadata: unknown;
	};
	disallows: {
		pausing: boolean;
		peeking_next: boolean;
		peeking_prev: boolean;
		resuming: boolean;
		seeking: boolean;
		skipping_next: boolean;
		skipping_prev: boolean;
	};
	paused: boolean;
	position: number;
	repeat_mode: number;
	shuffle: boolean;
	track_window: {
		current_track: WebPlaybackTrack;
		previous_tracks: WebPlaybackTrack[];
		next_tracks: WebPlaybackTrack[];
	};
}

interface WebPlaybackTrack {
	uri: string;
	id: string;
	type: string;
	media_type: string;
	name: string;
	is_playable: boolean;
	duration_ms: number;
	album: {
		uri: string;
		name: string;
		images: [{ url: string }];
	};
	artists: [{ uri: string; name: string }];
}
