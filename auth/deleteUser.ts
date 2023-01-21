import { Request, Response } from "express";
import userModel from "../models/user";

export default function DeleteUser(req: Request, res: Response) {
	const { email } = req.body;
	const token = req.headers.authorization;
	userModel
		.findOne({
			email,
		})
		.then((data) => {
			if (data?.token === token) {
				userModel
					.deleteOne({
						email,
					})
					.then(() => {
						res.status(200).json({
							status: "Success",
							message: "Deleted user successfully",
						});
					});
			}
		});
}
