import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrencyScraperService } from "./currency-scraper.service";

@ApiTags("currencies")
@Controller("currencies")
export class CurrencyScraperController {
  constructor(
    private readonly currencyScraperService: CurrencyScraperService,
  ) {}

  @Post("scrape")
  @ApiOperation({ summary: "Manually trigger currency scraping" })
  @ApiResponse({
    status: 200,
    description: "Currency scraping completed successfully",
  })
  async manualScrape() {
    await this.currencyScraperService.updateAllCurrencies();
    return { message: "Currency scraping completed successfully" };
  }
}
