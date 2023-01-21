import { Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { Page } from "puppeteer";

import {
	ArrangeMovie,
	Casts,
	Crew,
	MovieDetails,
	Votes,
	Feedback,
	Cast,
	CrewMember,
	FeedbackEntity,
} from "../types/intefaces";

export default function GetMovieInfo(req: Request, res: Response) {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin());
	try {
		const { movieUrl, city } = req.body;
		(async function () {
			const browser = await puppeteer.launch({
				args: ["--no-sandbox"],
				headless: true,
			});
			const page = await browser.newPage();
			await page.setUserAgent(
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
			);
			await page.goto(`https://in.bookmyshow.com/${city}${movieUrl}`, {
				timeout: 0,
			});
			await autoScroll(page);
			const imageSelector = "img.iZkqYT";
			const movieTitleSelector = "h1.styles__EventHeading-sc-qswwm9-6";
			const voteSelector = "div.fYXXmi";
			const hourSelector = "div.goQYox";
			const descriptionSelector = "div.ifFOpf span";
			const castSelector = "section#component-4 div.mXkAf div.dFSmrX a.ggVMyG";
			const feedbackSelector =
				"div.cshUsf div.style__ReviewContainer-sc-r6zm4d-0";
			const crewSelector = "section#component-5 div.mXkAf div.dFSmrX a.ggVMyG";
			const movieImage = await page.evaluate((imageSelector) => {
				const element = document.querySelector(imageSelector);
				const image = element?.getAttribute("src");
				return image;
			}, imageSelector);
			const movieTitle = await page.evaluate((movieTitleSelector) => {
				const element = document.querySelector(movieTitleSelector);
				const title = element?.textContent;
				return title;
			}, movieTitleSelector);
			const vote = await page.evaluate((voteSelector) => {
				let rating: string = "";
				let votes: string = "";
				const ratingElement = document.querySelector(
					`${voteSelector} span.bDPtxC`
				);
				const voteElement = document.querySelector(
					`${voteSelector} span.jVFghD`
				);
				rating = ratingElement?.textContent as string;
				votes = voteElement?.textContent as string;
				return {
					rating,
					votes,
				};
			}, voteSelector);
			const movieTime = await page.evaluate((hourSelector) => {
				const element = document.querySelectorAll(hourSelector)[1];
				const genre = element?.textContent?.split("•")[1].trim() as string;
				const label = element?.textContent?.split("•")[2].trim() as string;
				const time = element?.textContent?.split("•")[0].trim() as string;
				const release = element?.textContent?.split("•")[3].trim() as string;
				return {
					genre,
					label,
					time,
					release,
				};
			}, hourSelector);
			const description = await page.evaluate((descriptionSelector) => {
				const element = document.querySelector(descriptionSelector);
				const description = element?.textContent;
				return description;
			}, descriptionSelector);
			const casts = await page.evaluate((castSelector) => {
				const castImage: Array<string> = [];
				const castName: Array<string> = [];
				const castDesignation: Array<string> = [];
				document.querySelectorAll(`${castSelector} img`).forEach((element) => {
					castImage.push(element.getAttribute("src") as string);
				});
				document
					.querySelectorAll(`${castSelector} h5.wBzDy`)
					.forEach((element) => {
						castName.push(element.textContent as string);
					});
				document
					.querySelectorAll(`${castSelector} h5.jmczvl`)
					.forEach((element) => {
						castDesignation.push(element.textContent as string);
					});
				return {
					castImage,
					castDesignation,
					castName,
				};
			}, castSelector);
			const feedback = await page.evaluate((feedbackSelector) => {
				const hashTags: Array<string> = [];
				const feedback: Array<string> = [];
				const rating: Array<string> = [];
				const userImages: Array<string> = [];
				const userNames: Array<string> = [];
				document
					.querySelectorAll(`${feedbackSelector} h5.fHdPlg`)
					.forEach((element) => {
						hashTags.push(element.textContent as string);
					});
				document
					.querySelectorAll(`${feedbackSelector} p.ilCOB`)
					.forEach((element) => {
						feedback.push(element.textContent as string);
					});
				document
					.querySelectorAll(`${feedbackSelector} img`)
					.forEach((element) => {
						userImages.push(element.getAttribute("src") as string);
					});
				document
					.querySelectorAll(`${feedbackSelector} div.gRQhkh h5.jMEovZ`)
					.forEach((element) => {
						userNames.push(element.textContent as string);
					});
				document
					.querySelectorAll(`${feedbackSelector} div.iXDupn div`)
					.forEach((element) => {
						rating.push(element.textContent as string);
					});
				return {
					hashTags,
					feedback,
					rating,
					userImages,
					userNames,
				};
			}, feedbackSelector);
			const crew = await page.evaluate((crewSelector) => {
				const crewImage: Array<string> = [];
				const crewName: Array<string> = [];
				const crewDesignation: Array<string> = [];
				document.querySelectorAll(`${crewSelector} img`).forEach((element) => {
					crewImage.push(element.getAttribute("src") as string);
				});
				document
					.querySelectorAll(`${crewSelector} h5.wBzDy`)
					.forEach((element) => {
						crewName.push(element.textContent as string);
					});
				document
					.querySelectorAll(`${crewSelector} h5.jmczvl`)
					.forEach((element) => {
						crewDesignation.push(element.textContent as string);
					});
				return {
					crewDesignation,
					crewImage,
					crewName,
				};
			}, crewSelector);
			const output = arrange({
				movieDetails: movieTime,
				votes: vote,
				description: description as string,
				movieTitle: movieTitle as string,
				movieImage: movieImage as string,
				crewDetails: crew,
				feedbackDetails: feedback,
				castsDetails: casts,
			});
			res.status(200).json({
				status: "Success",
				description: "Movies Listed",
				data: {
					movie: output.response,
				},
			});
			await browser.close();
		})();
	} catch (err) {}
}

async function autoScroll(page: Page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;
				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve("");
				}
			}, 100);
		});
	});
}

function arrange(param: {
	movieDetails: MovieDetails;
	votes: Votes;
	description: string;
	movieTitle: string;
	movieImage: string;
	crewDetails: Crew;
	feedbackDetails: Feedback;
	castsDetails: Casts;
}): ArrangeMovie {
	const movieCast: Array<Cast> = [];
	const movieCrew: Array<CrewMember> = [];
	const feedback: Array<FeedbackEntity> = [];
	param.castsDetails.castImage.map((element, index) => {
		const cast: Cast = {
			castDesignation: param.castsDetails.castDesignation[index],
			castImage: element ?? "https://via.placeholder.com/120",
			castName: param.castsDetails.castName[index],
		};
		movieCast.push(cast);
	});
	param.crewDetails.crewImage.map((element, index) => {
		const crew: CrewMember = {
			crewDesignation: param.crewDetails.crewDesignation[index],
			crewImage: element ?? "https://via.placeholder.com/120",
			crewName: param.crewDetails.crewName[index],
		};
		movieCrew.push(crew);
	});

	param.feedbackDetails.userImages.map((element, index) => {
		const feed: FeedbackEntity = {
			feedback: param.feedbackDetails.feedback[index],
			hashTags: param.feedbackDetails.hashTags[index],
			rating: param.feedbackDetails.rating[index],
			userImages: element ?? "https://via.placeholder.com/120",
			userNames: param.feedbackDetails.userNames[index],
		};
		feedback.push(feed);
	});
	const resp: ArrangeMovie = {
		response: {
			movieImage: param.movieImage,
			movieTitle: param.movieTitle,
			description: param.description,
			movieGenre: param.movieDetails.genre,
			movieLabel: param.movieDetails.label,
			movieReleaseTime: param.movieDetails.release,
			movieShowTime: param.movieDetails.time,
			voteNumber: param.votes.votes,
			voteRating: param.votes.rating,
			casts: movieCast,
			crew: movieCrew,
			feedback: feedback,
		},
	};
	return resp;
}
