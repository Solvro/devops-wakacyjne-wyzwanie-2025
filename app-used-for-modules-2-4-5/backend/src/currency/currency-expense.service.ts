import { Injectable, Logger } from "@nestjs/common";

import { CurrencyService } from "../currency/currency.service";

@Injectable()
export class CurrencyExpenseService {
  private readonly logger = new Logger(CurrencyExpenseService.name);

  constructor(private readonly currencyService: CurrencyService) {}

  async convertExpenseAmountToPLN(
    amount: number,
    currency: string,
  ): Promise<number> {
    if (currency === "PLN" || !currency) {
      return amount;
    }
    try {
      return await this.currencyService.convertToPLN(amount, currency);
    } catch (error) {
      this.logger.error(
        `Failed to convert ${currency} to PLN, using original amount:`,
        error,
      );
      return amount;
    }
  }

  async getExchangeRateInfo(currency: string) {
    if (currency === "PLN" || !currency) {
      return { rate: 1, currency: "PLN" };
    }
    try {
      const rate = await this.currencyService.getExchangeRate(currency, "PLN");
      return { rate, currency };
    } catch (error) {
      this.logger.error(`Failed to get exchange rate for ${currency}:`, error);
      return { rate: 1, currency };
    }
  }
}
