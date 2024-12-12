import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				customWhite: "#EEEEEE",
				customDarkWhite: "#d1d1d1",
				fadedText: "#eeeeee80",
			},
		},
	},
	plugins: [],
} satisfies Config;
