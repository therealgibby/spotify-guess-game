import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "@/components/navbar";
import { getCurrentSession } from "@/lib/mongoose/auth";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Song-Guess",
	description: "Paste a Spotify playlist link and guess the song names.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user, session } = await getCurrentSession();
	let isLoggedIn = false;
	let username = "";
	if (user || session) {
		isLoggedIn = true;
		username = user.username;
	}

	return (
		<html lang="en">
			<body
				className={`min-h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NavBar isLoggedIn={isLoggedIn} username={username} />
				{children}
			</body>
		</html>
	);
}
