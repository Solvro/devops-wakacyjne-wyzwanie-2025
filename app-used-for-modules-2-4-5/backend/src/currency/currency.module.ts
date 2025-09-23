import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { CurrencyExpenseService } from "./currency-expense.service";
import { CurrencySchedulerService } from "./currency-scheduler.service";
import { CurrencyScraperController } from "./currency-scraper.controller";
import { CurrencyScraperService } from "./currency-scraper.service";
import { CurrencyController } from "./currency.controller";
import { CurrencyService } from "./currency.service";

@Module({
  imports: [DatabaseModule],
  controllers: [CurrencyController, CurrencyScraperController],
  providers: [
    CurrencyService,
    CurrencyScraperService,
    CurrencySchedulerService,
    CurrencyExpenseService,
  ],
  exports: [CurrencyService, CurrencyScraperService, CurrencyExpenseService],
})
export class CurrencyModule {}
