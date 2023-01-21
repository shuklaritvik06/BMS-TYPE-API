import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user";

export default function RegisterUser(req: Request, res: Response) {
	const { email, password } = req.body;
	const token = jwt.sign(
		{
			email,
			password,
		},
		process.env.SECRET as string
	);
	userModel
		.find({
			email: email,
		})
		.then((data) => {
			if (data.length != 0) {
				res.status(200).json({
					error: "User already registered",
				});
			} else {
				userModel
					.create({
						email: email,
						password: password,
						token: token,
					})
					.then(() => {
						res.status(200).json({
							status: "User created Successfully!",
							token: token,
						});
					});
			}
		});
}
