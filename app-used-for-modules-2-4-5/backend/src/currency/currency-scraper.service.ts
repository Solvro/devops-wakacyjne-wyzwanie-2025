import { load } from "cheerio";
import puppeteer, { Browser, Page } from "puppeteer";

import { Injectable, Logger } from "@nestjs/common";

import { CurrencyService } from "./currency.service";

export interface ScrapedCurrencyRate {
  code: string;
  name: string;
  rate: number;
}

@Injectable()
export class CurrencyScraperService {
  private readonly logger = new Logger(CurrencyScraperService.name);

  constructor(private readonly currencyService: CurrencyService) {}

  async scrapeFromWebsite(): Promise<ScrapedCurrencyRate[]> {
    let browser: Browser | undefined;
    try {
      const scrapedRates: ScrapedCurrencyRate[] = [];
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });
      const page: Page = await browser.newPage();
      const widgetUrl =
        "https://www.tradingview-widget.com/embed-widget/market-quotes/?locale=pl#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22symbolsGroups%22%3A%5B%7B%22name%22%3A%22Forex%22%2C%22originalName%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22name%22%3A%22SAXO%3AUSDPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AEURPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AAUDPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3ACADPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AGBPPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3ACHFPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3ASEKPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3ADKKPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDNOK%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDJPY%22%7D%2C%7B%22name%22%3A%22SAXO%3ACZKPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDHUF%22%7D%2C%7B%22name%22%3A%22SAXO%3ANZDPLN%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDCNH%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDHKD%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDILS%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDMXN%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDRON%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDTHB%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDTRY%22%7D%2C%7B%22name%22%3A%22SAXO%3AUSDZAR%22%7D%2C%7B%22name%22%3A%22SAXO%3AEURUSD%22%7D%2C%7B%22name%22%3A%22SAXO%3AGBPUSD%22%7D%2C%7B%22name%22%3A%22BINANCE%3ABTCUSD%22%7D%2C%7B%22name%22%3A%22BINANCE%3ADOGEUSD%22%7D%2C%7B%22name%22%3A%22BINANCE%3AETHUSD%22%7D%2C%7B%22name%22%3A%22BINANCE%3ALTCUSD%22%7D%5D%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22utm_source%22%3A%22waluty24.info%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22market-quotes%22%2C%22page-uri%22%3A%22waluty24.info%2F%22%7D";
      await page.goto(widgetUrl, {
        waitUntil: "networkidle2",
        timeout: 30_000,
      });
      await page.waitForSelector(".market-quotes-widget__row--symbol", {
        timeout: 15_000,
      });
      const html = await page.content();
      const $ = load(html);
      const symbolRows = $(".market-quotes-widget__row--symbol");
      if (symbolRows.length === 0) {
        this.logger.error("No symbol rows found");
        return [];
      }
      symbolRows.each((_, element) => {
        const $element = $(element);
        const currencyPair = $element
          .find(".js-symbol-short-name")
          .text()
          .trim();
        const rateText = $element.find(".js-symbol-last").text().trim();
        if (currencyPair && rateText) {
          let currencyCode = "";
          let rate = 0;
          if (currencyPair.endsWith("PLN") && currencyPair.length === 6) {
            currencyCode = currencyPair.slice(0, 3);
            rate = this.parseRate(rateText);
          }
          if (currencyCode && rate > 0) {
            scrapedRates.push({
              code: currencyCode,
              name: this.getCurrencyName(currencyCode),
              rate,
            });
          }
        }
      });
      if (scrapedRates.length === 0) {
        this.logger.error("No rates found");
      }
      return scrapedRates;
    } catch (error) {
      this.logger.error("Failed to scrape currency rates", error);
      return [];
    } finally {
      if (browser !== undefined) {
        await browser.close();
      }
    }
  }

  private parseRate(rateText: string): number {
    const cleanText = rateText.replaceAll(/\s/g, "").replaceAll(",", ".");
    const rate = Number.parseFloat(cleanText);
    return Number.isNaN(rate) ? 0 : rate;
  }

  async scrapeAllSources(): Promise<ScrapedCurrencyRate[]> {
    const rates = await this.scrapeFromWebsite();
    if (rates.length === 0) {
      this.logger.error("Web scraping failed");
    }
    return rates;
  }

  async updateAllCurrencies(): Promise<void> {
    try {
      const scrapedRates = await this.scrapeAllSources();
      for (const scrapedRate of scrapedRates) {
        try {
          await this.currencyService.updateExchangeRate(
            scrapedRate.code,
            scrapedRate.rate,
          );
        } catch {
          await this.currencyService.create({
            code: scrapedRate.code,
            name: scrapedRate.name,
            currentRate: scrapedRate.rate,
            isActive: true,
          });
        }
      }
    } catch (error) {
      this.logger.error("Failed to update currencies:", error);
    }
  }

  private getCurrencyName(code: string): string {
    const currencyNames: Record<string, string> = {
      EUR: "Euro",
      USD: "United States Dollar",
      GBP: "British Pound",
      CHF: "Swiss Franc",
      CZK: "Czech Koruna",
      SEK: "Swedish Krona",
      NOK: "Norwegian Krone",
      DKK: "Danish Krone",
      JPY: "Japanese Yen",
      CAD: "Canadian Dollar",
      AUD: "Australian Dollar",
      NZD: "New Zealand Dollar",
      HUF: "Hungarian Forint",
      MXN: "Mexican Peso",
      RON: "Romanian Leu",
      THB: "Thai Baht",
      TRY: "Turkish Lira",
      ZAR: "South African Rand",
      CNH: "Chinese Yuan",
      HKD: "Hong Kong Dollar",
    };
    return currencyNames[code] || `${code} Currency`;
  }
}
