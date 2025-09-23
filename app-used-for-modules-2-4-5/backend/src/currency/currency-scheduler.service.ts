import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { CurrencyScraperService } from "./currency-scraper.service";

@Injectable()
export class CurrencySchedulerService {
  private readonly logger = new Logger(CurrencySchedulerService.name);

  constructor(
    private readonly currencyScraperService: CurrencyScraperService,
  ) {}

  @Cron("0 6 * * 1-6")
  async handleCurrencyUpdate() {
    try {
      await this.currencyScraperService.updateAllCurrencies();
    } catch (error) {
      this.logger.error("Failed scheduled currency update", error);
    }
  }

  async triggerManualUpdate(): Promise<void> {
    try {
      await this.currencyScraperService.updateAllCurrencies();
    } catch (error) {
      this.logger.error("Failed manual currency update", error);
    }
  }
}
