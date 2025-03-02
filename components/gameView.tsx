"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
	trackName: string;
	playNextTrack: () => void;
	revealTrackName: () => void;
	showTrackName: boolean;
	albumImageUrl: string;
}

export default function GameView({
	trackName,
	playNextTrack,
	revealTrackName,
	showTrackName,
	albumImageUrl,
}: Props) {
	const router = useRouter();
	const timeoutFunctionId = useRef<NodeJS.Timeout>();
	const [timeLeft, setTimeLeft] = useState(20);
	const [songsPlayed, setSongsPlayed] = useState(0);
	const [score, setScore] = useState(0);
	const [isGuessingPaused, setIsGuessingPaused] = useState(false);

	// ends the current guess and clears the automatic timeout
	async function handleGuess(inputElement: HTMLInputElement, guess: string) {
		if (
			cleanTrackName(guess, true) == cleanTrackName(trackName, true) &&
			!isGuessingPaused
		) {
			inputElement.value = "";
			clearTimeout(timeoutFunctionId.current);
			setIsGuessingPaused(true);
			revealTrackName();
			setScore(score + 1);

			setTimeout(() => {
				playNextTrack();
				setTimeLeft(20);
			}, 5000);

			setTimeout(() => {
				setIsGuessingPaused(false);
			}, 5300);
		}
	}

	// timer for the game
	useEffect(() => {
		const intervalId = setInterval(() => {
			if (timeLeft > 0) {
				setTimeLeft(timeLeft - 1);
			} else {
				clearInterval(intervalId);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [timeLeft]);

	// starts next song
	useEffect(() => {
		if (trackName) {
			setSongsPlayed((song) => song + 1);
			setTimeLeft(20);

			timeoutFunctionId.current = setTimeout(() => {
				setIsGuessingPaused(true);
				revealTrackName();

				setTimeout(() => {
					playNextTrack();
					setTimeLeft(20);
				}, 5000);

				setTimeout(() => {
					setIsGuessingPaused(false);
				}, 5300);
			}, 20000);
		}
	}, [trackName, playNextTrack, revealTrackName]);

	useEffect(() => {
		if (songsPlayed > 20) {
			router.push(`/`);
		}
	}, [songsPlayed, router]);

	return (
		<div className="w-[300px] flex flex-col justify-center items-center">
			{!isGuessingPaused && trackName ? (
				<>
					{timeLeft < 10 ? (
						<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
							0:0{`${timeLeft}`}
						</span>
					) : (
						<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
							0:{`${timeLeft}`}
						</span>
					)}
				</>
			) : (
				<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
					0:00
				</span>
			)}

			{showTrackName ? (
				<>
					<Image
						src={`${albumImageUrl}`}
						className="mb-[20px]"
						alt="album image of the song playing"
						width={300}
						height={300}
					/>
					<p className="font-semibold text-[20px] text-nowrap text-center">
						{`${trackName}`}
					</p>
				</>
			) : (
				<p className="font-semibold text-[20px] text-nowrap text-center mt-[320px]">
					{getTrackBlanks(`${trackName}`)}
				</p>
			)}
			{trackName ? (
				<span className="font-semibold text-[18px] mt-[32px] mb-[8px]">
					Song: {`${songsPlayed}`}/20
				</span>
			) : (
				<span className="font-semibold text-[18px] mt-[62px] mb-[8px]">
					Song: {`${songsPlayed}`}/20
				</span>
			)}
			<input
				className="bg-[#242424] w-full block px-[12px] py-[8px] rounded-[10px] text-[18px] text-[#ffff] placeholder:text-[#eeeeee80] outline-none"
				onChange={(event) => {
					handleGuess(event.target, event.target.value);
				}}
			/>
			<span className="font-semibold text-[18px] mt-[12px]">
				Score: {`${score}`}/20
			</span>
		</div>
	);
}

/*
	Removes unnecessary words from Spotify song title
	If isForGuess == true, it removes spaces from the string
	All for an easier guess
*/
function cleanTrackName(trackName: string, isForGuess = false): string {
	if (!trackName) {
		return "";
	}

	trackName = trackName.toLowerCase();

	trackName = trackName
		.replace(
			/\s*-\s*\d*\s*(remaster(?:ed)?|live|acoustic|remix|with|radio|edit|mix|version)\b.*/gi,
			""
		) // Remove unwanted words with preceding '-'
		.replace(/\s*\(([^)]*)\)/g, "") // Remove parenthesis and contents
		.replace(/\s*&\s*/g, " and ") // Replace "&" with "and"
		.trim();

	if (isForGuess) {
		trackName = trackName.replace(/[^a-zA-Z0-9]/g, "");
	}

	return trackName;
}

function getTrackBlanks(trackName: string): string {
	const cleanedTrackName = cleanTrackName(trackName);

	let blanks = "";

	if (!cleanedTrackName) {
		return "";
	}

	[...cleanedTrackName].forEach((c) => {
		if (c === " ") {
			blanks += "\xa0\xa0";
		} else if (
			c === "-" ||
			c === "?" ||
			c === "." ||
			c === "!" ||
			c === "’" ||
			c === "'" ||
			c === ","
		) {
			blanks += `${c} `;
		} else if (c === "&") {
			blanks += "_ _ _ ";
		} else {
			blanks += "_ ";
		}
	});

	return blanks;
}
