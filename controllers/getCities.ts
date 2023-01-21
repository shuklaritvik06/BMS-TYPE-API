import { Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

export default function GetCities(req: Request, res: Response) {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin());
	(async () => {
		const browser = await puppeteer.launch({
			args: ["--no-sandbox"],
			headless: true,
		});
		const page = await browser.newPage();
		await page.setUserAgent(
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
		);
		await page.goto("https://in.bookmyshow.com/", {
			timeout: 0,
		});
		const citiesSelector = ".sc-kTUwUJ";
		await page.waitForSelector(citiesSelector);
		const buttonSelector = ".NVnzM";
		await page.click(buttonSelector);
		const resultsSelector = ".sc-cCbXAZ";
		const cities = await page.evaluate((resultsSelector) => {
			const response: Array<string> = [];
			document.querySelectorAll(".sc-cCbXAZ").forEach((element) => {
				response.push(element.innerHTML);
			});
			return response;
		}, resultsSelector);
		res.status(200).json({
			status: "Success",
			description: "Cities",
			data: cities,
		});
		await browser.close();
	})();
}
