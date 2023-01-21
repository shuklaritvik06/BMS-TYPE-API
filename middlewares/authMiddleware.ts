import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import SECRET from "../config/config";
import userModel from "../models/user";
interface Decoded {
	email?: string;
	password?: string;
}
export default function Auth(req: Request, res: Response, next: NextFunction) {
	const token = req.headers.authorization as string;
	if (token != undefined) {
		try {
			const decoded: (string | jwt.JwtPayload) & Decoded = jwt.verify(
				token,
				SECRET.first
			);
			userModel
				.findOne({
					email: decoded.email,
				})
				.then((data) => {
					if (data != undefined) {
						next();
					} else {
						res.status(401).json({
							message: "Forbidden!",
						});
					}
				});
		} catch (err) {}
	} else {
		res.status(401).json({
			message: "Please provide auth token",
		});
	}
}
