import express, { Request } from "express";
import cors from "cors";
import router from "./routes/router";
const PORT: number | string = process.env.PORT || 5000;
const app: express.Express = express();
app.use(express.json());
app.use(cors<Request>());
app.use("/", router);
app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
