import * as express from "express";
import DeleteUser from "../auth/deleteUser";
import RegisterUser from "../auth/register";
import {
	GetCinemas,
	GetCities,
	GetMovieInfo,
	GetTheatreMovies,
	GetUpcoming,
} from "../controllers";
import Auth from "../middlewares/authMiddleware";
const router = express.Router();
router.get("/", (req, res) => {
	res.send("API IS UP!");
});
router.get("/upcoming", Auth, GetUpcoming);
router.get("/cities", Auth, GetCities);
router.get("/cinemas", Auth, GetCinemas);
router.get("/theatre", Auth, GetTheatreMovies);
router.get("/info", Auth, GetMovieInfo);
router.post("/register", RegisterUser);
router.delete("/delete", DeleteUser);
export default router;
