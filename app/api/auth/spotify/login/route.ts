import { spotify } from "@/lib/oauth/spotify";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
	const state = generateState();
	const url = spotify.createAuthorizationURL(state, [
		"user-read-private",
		"user-read-email",
		"streaming",
	]);

	const cookieStore = await cookies();
	cookieStore.set("spotify_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
}
