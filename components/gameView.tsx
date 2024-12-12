"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
	trackName: string;
	playNextTrack: () => void;
	setShowTrackNameTrue: () => void;
	showTrackName: boolean;
	albumImageUrl: string;
}

export default function GameView({
	trackName,
	playNextTrack,
	setShowTrackNameTrue,
	showTrackName,
	albumImageUrl,
}: Props) {
	const router = useRouter();
	const [timeLeft, setTimeLeft] = useState(20);
	const [songsPlayed, setSongsPlayed] = useState(0);
	const [score, setScore] = useState(0);
	const [input, setInput] = useState("");
	const [isGuessingPaused, setIsGuessingPaused] = useState(false);
	const [currentTrackName, setCurrentTrackName] = useState(trackName);
	const [timeoutFunctionId, setTimeoutFunctionId] = useState(0);

	// ends the current guess and clears the automatic timeout
	async function handleGuess(guess: string) {
		if (
			cleanTrackName(guess, true) == cleanTrackName(trackName, true) &&
			!isGuessingPaused
		) {
			clearTimeout(timeoutFunctionId);
			setIsGuessingPaused(true);
			setShowTrackNameTrue();
			setScore(score + 1);
			setInput("");

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

	// runs to start the next guess if the user didn't guess
	useEffect(() => {
		if (trackName) {
			setSongsPlayed(songsPlayed + 1);
		}
		setCurrentTrackName(trackName);
		setTimeLeft(20);
		if (trackName) {
			const timeoutFuncId = setTimeout(() => {
				setIsGuessingPaused(true);
				setShowTrackNameTrue();

				setTimeout(() => {
					playNextTrack();
					setTimeLeft(20);
				}, 5000);

				setTimeout(() => {
					setIsGuessingPaused(false);
				}, 5300);
			}, 20000);

			setTimeoutFunctionId(timeoutFuncId as unknown as number);
		}
	}, [trackName, playNextTrack, setShowTrackNameTrue]);

	useEffect(() => {
		if (songsPlayed > 20) {
			router.push(`/`);
		}
	}, [songsPlayed]);

	return (
		<div className="w-[300px] flex flex-col justify-center items-center">
			{!isGuessingPaused && currentTrackName ? (
				<>
					{timeLeft < 10 ? (
						<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
							0:0{timeLeft}
						</span>
					) : (
						<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
							0:{timeLeft}
						</span>
					)}
				</>
			) : (
				<span className="font-semibold text-[18px] text-fadedText mb-[8px]">
					0:00
				</span>
			)}

			{showTrackName && albumImageUrl ? (
				<>
					<img src={`${albumImageUrl}`} className="mb-[20px]" />
					<p className="font-semibold text-[20px] text-nowrap text-center">
						{trackName}
					</p>
				</>
			) : (
				<p className="font-semibold text-[20px] text-nowrap text-center mt-[320px]">
					{getTrackBlanks(trackName)}
				</p>
			)}
			{trackName ? (
				<span className="font-semibold text-[18px] mt-[32px] mb-[8px]">
					Song: {songsPlayed}/20
				</span>
			) : (
				<span className="font-semibold text-[18px] mt-[62px] mb-[8px]">
					Song: {songsPlayed}/20
				</span>
			)}
			<input
				className="bg-[#242424] w-full block px-[12px] py-[8px] rounded-[10px] text-[18px] text-[#ffff] placeholder:text-[#eeeeee80] outline-none"
				value={input}
				onChange={(event) => {
					setInput(event.target.value);
					handleGuess(event.target.value);
				}}
			/>
			<span className="font-semibold text-[18px] mt-[12px]">
				Score: {score}/20
			</span>
		</div>
	);
}

function cleanTrackName(trackName: string, isForGuess = false): string {
	if (!trackName) {
		return "";
	}

	trackName = trackName.toLowerCase();

	if (trackName.includes("(") && trackName.includes(")")) {
		if (trackName.indexOf("(") === 0) {
			trackName = trackName.slice(trackName.indexOf(")") + 1);
		} else {
			trackName = trackName.slice(0, trackName.lastIndexOf("("));
		}
	}

	while (
		(trackName.includes("remaster") ||
			trackName.includes("live") ||
			trackName.includes("acoustic") ||
			trackName.includes("remix") ||
			trackName.includes("with") ||
			trackName.includes("radio") ||
			trackName.includes("edit") ||
			trackName.includes("mix") ||
			trackName.includes("version")) &&
		trackName.includes("-")
	) {
		const lastHyphen = trackName.lastIndexOf("-");
		trackName = trackName.slice(0, lastHyphen);
	}

	if (isForGuess) {
		trackName = trackName.replace(/[^a-zA-Z0-9]/g, "");
	}

	trackName = trackName.trim();

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
			c === "&" ||
			c === "?" ||
			c === "." ||
			c === "!" ||
			c === "’" ||
			c === "'" ||
			c === ","
		) {
			blanks += `${c} `;
		} else {
			blanks += "_ ";
		}
	});

	return blanks;
}
