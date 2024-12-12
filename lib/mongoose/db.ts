import mongoose, { models } from "mongoose";

export default async function connectDb(): Promise<{ message: string }> {
	if (!process.env.MONGO_URI) {
		return { message: "No DB URI detected" };
	}

	if (
		!(
			mongoose.connection.readyState === 0 ||
			mongoose.connection.readyState === 99
		)
	) {
		return { message: "" };
	}

	const dbConnectionMessage = await mongoose
		.connect(process.env.MONGO_URI)
		.then((instance) => {
			if (instance) return "Successfully connected to DB";
			return "Failed to connect to DB";
		})
		.catch((error) => {
			console.log(error);
			return "Error connecting to DB";
		});

	console.log(dbConnectionMessage);

	return { message: dbConnectionMessage };
}

export const User =
	models.user ||
	mongoose.model<IUser>(
		"user",
		new mongoose.Schema<IUser>({
			_id: {
				type: String,
				required: true,
			},
			spotify_id: {
				type: String,
				required: true,
			},
			username: {
				type: String,
				required: true,
			},
		})
	);

export const Session =
	models.session ||
	mongoose.model<ISession>(
		"session",
		new mongoose.Schema<ISession>({
			_id: {
				type: String,
				required: true,
			},
			expires_at: {
				type: Date,
				required: true,
			},
			user_id: {
				type: String,
				required: true,
			},
			spotify_access_token: {
				type: String,
				required: true,
			},
			spotify_refresh_token: {
				type: String,
				required: true,
			},
		})
	);

export interface IUser {
	_id: string;
	spotify_id: string;
	username: string;
}

export interface ISession {
	_id: string;
	expires_at: Date;
	user_id: string;
	spotify_access_token: string;
	spotify_refresh_token: string;
}
