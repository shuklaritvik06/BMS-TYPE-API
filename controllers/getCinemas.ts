import { Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
interface ArrangeCinemas {
	response: Array<Object>;
}
export default function GetCinemas(req: Request, res: Response) {
	const { city } = req.body;
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin());
	try {
		(async function () {
			const browser = await puppeteer.launch({
				args: ["--no-sandbox"],
				headless: true,
			});
			const page = await browser.newPage();
			await page.goto(`https://in.bookmyshow.com/${city}/cinemas`, {
				timeout: 0,
			});
			const cinemaTextSelector = "div.__cinema-text a";
			const cinemaImageSelector = "div.__cinema-image img";
			const result = await page.evaluate((cinemaTextSelector) => {
				const cinemaText: Array<string> = [];
				const cinemaValues: Array<string> = [];
				document.querySelectorAll(cinemaTextSelector).forEach((element) => {
					cinemaText.push(element.innerHTML);
					cinemaValues.push(element.getAttribute("href") as string);
				});
				return {
					cinemaText,
					cinemaValues,
				};
			}, cinemaTextSelector);
			const images = await page.evaluate((cinemaImageSelector) => {
				const cinemaImages: Array<string> = [];
				document.querySelectorAll(cinemaImageSelector).forEach((element) => {
					cinemaImages.push("http:" + (element.getAttribute("src") as string));
				});
				return cinemaImages;
			}, cinemaImageSelector);
			const output = arrange({
				imagesList: images,
				cinemasTitleList: result.cinemaText,
				cinemaValueList: result.cinemaValues,
				city: city,
			});
			res.status(200).json({
				status: "Success",
				description: "Cinemas near you",
				data: output.response,
			});
			await browser.close();
		})();
	} catch (err) {}
}

function arrange(param: {
	imagesList: Array<string>;
	cinemasTitleList: Array<string>;
	cinemaValueList: Array<string>;
	city: string;
}): ArrangeCinemas {
	const resp: Array<Object> = [];
	param.imagesList.forEach((element, index) => {
		resp.push({
			image: element,
			cinemaName: param.cinemasTitleList[index],
			cinemaValue: param.cinemaValueList[index],
			city: param.city,
		});
	});
	return {
		response: resp,
	};
}
