import * as dotenv from "dotenv";
dotenv.config();
export default {
	first: `${process.env.SECRET}`,
	second: `${process.env.DB_URI}`,
};
