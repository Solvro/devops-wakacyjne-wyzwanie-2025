import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrencyService } from "./currency.service";
import { CreateCurrencyDto } from "./dto/create-currency.dto";
import { currencyToMetadata } from "./dto/currency-metadata.dto";
import { ExchangeRateHistoryQueryDto } from "./dto/exchange-rate-history.dto";
import { ExchangeRateToMetadata } from "./dto/exchange-rate-metadata.dto";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";

@ApiTags("currencies")
@Controller("currencies")
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiOperation({ summary: "Create a new currency" })
  @ApiResponse({
    status: 201,
    description: "The currency has been successfully created.",
    type: currencyToMetadata,
  })
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all currencies" })
  @ApiResponse({
    status: 200,
    description: "Return all currencies.",
    type: [currencyToMetadata],
  })
  async findAll() {
    return this.currencyService.findAll();
  }

  @Get(":code")
  @ApiOperation({ summary: "Get a currency" })
  @ApiResponse({
    status: 200,
    description: "Return the currency.",
    type: currencyToMetadata,
  })
  @ApiResponse({ status: 404, description: "Currency not found." })
  async findOne(@Param("code") code: string) {
    return this.currencyService.findOne(code);
  }

  @Patch(":code")
  @ApiOperation({ summary: "Update a currency" })
  @ApiResponse({
    status: 200,
    description: "The currency has been successfully updated.",
    type: currencyToMetadata,
  })
  @ApiResponse({ status: 404, description: "Currency not found." })
  async update(
    @Param("code") code: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(code, updateCurrencyDto);
  }

  @Get(":code/history")
  @ApiOperation({ summary: "Get exchange rate history for a currency" })
  @ApiResponse({
    status: 200,
    description: "Return exchange rate history for the currency.",
    type: [ExchangeRateToMetadata],
  })
  @ApiResponse({ status: 404, description: "Currency not found." })
  async getExchangeHistory(
    @Param("code") code: string,
    @Query() query: ExchangeRateHistoryQueryDto,
  ) {
    return this.currencyService.getExchangeRateHistory(code, query);
  }
}
