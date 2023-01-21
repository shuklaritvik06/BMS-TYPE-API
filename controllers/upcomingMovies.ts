import { Request, Response } from "express";
import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
interface Arrange {
	response: Array<Object>;
}
export default function GetUpcomingMovies(req: Request, res: Response) {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin());
	const { city } = req.body;
	try {
		(async () => {
			const browser = await puppeteer.launch({
				args: ["--no-sandbox"],
				headless: true,
			});
			const page = await browser.newPage();
			await page.setUserAgent(
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
			);
			await page.goto(
				`https://in.bookmyshow.com/explore/upcoming-movies-${city}?referrerBase=movies`,
				{
					timeout: 0,
				}
			);
			await autoScroll(page);
			const imageSelectorTwo = "div.XxsAZ>img";
			const imageSelectorOne = "div.TsmVt>img";
			const titleSelector = "div.cBsijw";
			const genreSelector = "div.bMPkUy";
			const likesSelector = "div.gifyKd";
			await page.waitForSelector(imageSelectorOne);
			await page.waitForSelector(imageSelectorTwo);
			const imageListOne = await page.evaluate((imageSelectorOne) => {
				const images: Array<string> = [];
				document.querySelectorAll(imageSelectorOne).forEach((element) => {
					if (element.getAttribute("alt")?.length != 0) {
						images.push(element.getAttribute("src") as string);
					}
				});
				return images;
			}, imageSelectorOne);
			const imageListTwo = await page.evaluate((imageSelectorTwo) => {
				const images: Array<string> = [];
				document.querySelectorAll(imageSelectorTwo).forEach((element) => {
					if (element.getAttribute("alt")?.length != 0) {
						images.push(element.getAttribute("src") as string);
					} else {
						return;
					}
				});
				return images;
			}, imageSelectorTwo);
			const genreList = await page.evaluate((genreSelector) => {
				const genre: Array<string> = [];
				document.querySelectorAll(genreSelector).forEach((element) => {
					genre.push(element.innerHTML);
				});
				return genre;
			}, genreSelector);
			const titleList = await page.evaluate((titleSelector) => {
				const title: Array<string> = [];
				document.querySelectorAll(titleSelector).forEach((element) => {
					title.push(element.innerHTML);
				});
				return title;
			}, titleSelector);
			const likesList = await page.evaluate((likesSelector) => {
				const likes: Array<string> = [];
				document.querySelectorAll(likesSelector).forEach((element) => {
					likes.push(
						element.innerHTML.replace(/(?:^(?:&nbsp;)+)|(?:(?:&nbsp;)+$)/g, "")
					);
				});
				return likes;
			}, likesSelector);
			const images: Array<string> = [...imageListOne, ...imageListTwo];
			const output = arrange({
				imagesList: images,
				genres: genreList,
				titles: titleList,
				likes: likesList,
			});
			res.status(200).json({
				status: "Success",
				description: `Upcoming Movies in ${city}`,
				data: output.response,
			});
			await browser.close();
		})();
	} catch (err) {}
}

async function autoScroll(page: Page) {
	await page.evaluate(async () => {
		await new Promise<void>((resolve) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = 7000;
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

function arrange(param: {
	imagesList: Array<string>;
	genres: Array<string>;
	titles: Array<string>;
	likes: Array<string>;
}): Arrange {
	const resp: Array<Object> = [];
	console.log(param.imagesList);
	param.imagesList.map((element, index) => {
		resp.push({
			image: element,
			title: param.titles[index],
			genre: param.genres[index],
			likes: param.likes[index],
		});
	});
	return {
		response: resp,
	};
}
