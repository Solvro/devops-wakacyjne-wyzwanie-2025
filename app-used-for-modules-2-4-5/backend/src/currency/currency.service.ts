import { Injectable, NotFoundException } from "@nestjs/common";

import { DatabaseService } from "../database/database.service";
import { CreateCurrencyDto } from "./dto/create-currency.dto";
import { ExchangeRateHistoryQueryDto } from "./dto/exchange-rate-history.dto";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";

@Injectable()
export class CurrencyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    return await this.databaseService.currency.create({
      data: {
        code: createCurrencyDto.code,
        name: createCurrencyDto.name,
        currentRate: createCurrencyDto.currentRate.toString(),
        isActive: createCurrencyDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return await this.databaseService.currency.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  }

  async findOne(code: string) {
    const currency = await this.databaseService.currency.findUnique({
      where: { code },
    });
    if (currency === null) {
      throw new NotFoundException(`Currency with code ${code} not found`);
    }
    return currency;
  }

  async update(code: string, updateCurrencyDto: UpdateCurrencyDto) {
    await this.findOne(code);
    return await this.databaseService.currency.update({
      where: { code },
      data: {
        code: updateCurrencyDto.code,
        name: updateCurrencyDto.name,
        currentRate:
          typeof updateCurrencyDto.currentRate === "number"
            ? updateCurrencyDto.currentRate.toString()
            : undefined,
        isActive: updateCurrencyDto.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async remove(code: string) {
    await this.findOne(code);
    return await this.databaseService.currency.delete({
      where: { code },
    });
  }

  async getExchangeRate(
    fromCurrency: string,
    toCurrency = "PLN",
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }
    if (toCurrency === "PLN") {
      const currency = await this.findOne(fromCurrency);
      return Number.parseFloat(currency.currentRate.toString());
    }
    throw new Error(
      `Currency conversion from ${fromCurrency} to ${toCurrency} is not supported`,
    );
  }

  async updateExchangeRate(
    currencyCode: string,
    rate: number,
    source?: string,
  ) {
    const currency = await this.findOne(currencyCode);

    await this.databaseService.currency.update({
      where: { code: currency.code },
      data: {
        currentRate: rate.toString(),
        updatedAt: new Date(),
      },
    });
    await this.databaseService.exchangeRate.create({
      data: {
        currencyId: currency.code,
        rate: rate.toString(),
        source: source ?? "waluty24.info",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return currency;
  }

  async getExchangeRateHistory(
    currencyCode: string,
    query: ExchangeRateHistoryQueryDto,
  ) {
    const currency = await this.findOne(currencyCode);
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const startDate =
      query.startDate != null && query.startDate !== ""
        ? new Date(query.startDate)
        : new Date(0);
    const endDate =
      query.endDate != null && query.endDate !== ""
        ? new Date(query.endDate)
        : new Date();
    return await this.databaseService.exchangeRate.findMany({
      where: {
        currencyId: currency.code,
        isActive: true,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async convertToPLN(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === "PLN") {
      return amount;
    }
    const rate = await this.getExchangeRate(fromCurrency, "PLN");
    return amount * rate;
  }
}
