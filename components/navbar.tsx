interface Props {
	isLoggedIn: boolean;
	username?: string;
}

export default function NavBar({ isLoggedIn, username }: Props) {
	if (isLoggedIn) {
		return (
			<div className="bg-[#242424] h-[80px] flex flex-row items-center justify-center relative">
				<p className="font-semibold text-[18px]">
					Signed in as {username}
				</p>
				<form
					action={"/api/auth/spotify/logout"}
					method="POST"
					className="flex justify-center items-center"
				>
					<button className="absolute font-semibold text-[18px] right-[60px] hover:text-customDarkWhite">
						Logout
					</button>
				</form>
			</div>
		);
	}

	return (
		<div className="bg-[#242424] h-[80px] flex items-center justify-center">
			<form action={"/api/auth/spotify/login"} method="POST">
				<button className="font-semibold text-[18px] hover:text-customDarkWhite">
					Login
				</button>
			</form>
		</div>
	);
}
