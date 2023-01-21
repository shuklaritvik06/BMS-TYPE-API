import mongoose from "mongoose";
import SECRET from "../config/config";
mongoose
	.connect(SECRET.second)
	.then(() => console.log("Database Connected Successfully!"));
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;
