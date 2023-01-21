import { Request, Response } from "express";
import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

interface ArrangeTheatre {
	response: Array<Object>;
}

export default function GetTheatreMovies(req: Request, res: Response) {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin());
	try {
		const { city, cinemaUrl } = req.body;
		(async function () {
			const browser = await puppeteer.launch({
				args: ["--no-sandbox"],
				headless: true,
			});
			const page = await browser.newPage();
			await page.setUserAgent(
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
			);
			await page.goto(`https://in.bookmyshow.com/${city}${cinemaUrl}`, {
				timeout: 0,
			});
			await autoScroll(page);
			const nameSelector = "span.__name a";
			const eventSelector = "div.eventInfo";
			const timeSelector = "div.showtimes-body";
			const locationSelector = "span.venue-location";
			const mapSelector = "a.map-icon";
			const mapLocation = await page.evaluate((mapSelector) => {
				const Map: Array<string> = [];
				const element = document.querySelector(mapSelector);
				Map.push(element?.getAttribute("href") as string);
				return Map;
			}, mapSelector);
			const location = await page.evaluate((locationSelector) => {
				const Address: Array<string> = [];
				const element = document.querySelector(locationSelector);
				Address.push(element?.textContent as string);
				return Address;
			}, locationSelector);
			const movies = await page.evaluate((nameSelector) => {
				const moviesList: Array<string> = [];
				const movieUrl: Array<string> = [];
				document.querySelectorAll(nameSelector).forEach((element) => {
					moviesList.push(element.innerHTML.trim());
					movieUrl.push(element.getAttribute("href") as string);
				});
				return {
					movieUrl,
					moviesList,
				};
			}, nameSelector);
			const time = await page.evaluate((timeSelector) => {
				const timeSlots: Array<string[]> = [];
				document.querySelectorAll(timeSelector).forEach((element) => {
					const times: Array<string> = [];
					element.childNodes.forEach((ele, index) => {
						if ((index + 1) % 2 == 0) {
							times.push(ele.textContent?.trim() as string);
						}
					});
					timeSlots.push(times);
				});
				return timeSlots;
			}, timeSelector);
			const types = await page.evaluate((eventSelector) => {
				const language: Array<string> = [];
				const format: Array<string> = [];
				document.querySelectorAll(`${eventSelector} a`).forEach((element) => {
					language.push(element.innerHTML);
				});
				document.querySelectorAll(eventSelector).forEach((element) => {
					format.push((element.textContent as string).split(" ")[1]);
				});
				return {
					language,
					format,
				};
			}, eventSelector);

			const output = arrange({
				formatList: types.format,
				languageList: types.language,
				movieList: movies.moviesList,
				movieUrl: movies.movieUrl,
				timeList: time,
			});
			res.status(200).json({
				status: "Success",
				description: "Movies Listed",
				data: {
					address: location[0],
					movies: output.response,
					map: mapLocation[0],
				},
			});
		})();
	} catch (err) {}
}

function arrange(param: {
	movieUrl: Array<string>;
	movieList: Array<string>;
	languageList: Array<string>;
	formatList: Array<string>;
	timeList: Array<string[]>;
}): ArrangeTheatre {
	const resp: Array<Object> = [];
	param.movieList.forEach((element, index) => {
		resp.push({
			movie: element,
			movieUrl: param.movieUrl[index],
			language: param.languageList[index],
			format: param.formatList[index],
			times: param.timeList[index],
		});
	});
	return {
		response: resp,
	};
}

async function autoScroll(page: Page) {
	await page.evaluate(async () => {
		await new Promise<void>((resolve) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.clientHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 100);
		});
	});
}
