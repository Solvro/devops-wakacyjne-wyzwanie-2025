import { Payment } from "@prisma/client";

import { Injectable, NotFoundException } from "@nestjs/common";

import { CurrencyService } from "../currency/currency.service";
import { DatabaseService } from "../database/database.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Injectable()
export class PaymentService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly currencyService: CurrencyService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const exchangeRate = await this.currencyService.getExchangeRate(
      createPaymentDto.originalCurrency,
      "PLN",
    );
    const amountPLN = await this.currencyService.convertToPLN(
      createPaymentDto.originalAmount,
      createPaymentDto.originalCurrency,
    );
    const payment = await this.databaseService.payment.create({
      data: {
        title: createPaymentDto.title,
        description: createPaymentDto.description,
        originalAmount: createPaymentDto.originalAmount,
        originalCurrency: createPaymentDto.originalCurrency,
        amountPLN,
        exchangeRate,
        participantId: createPaymentDto.participantId,
        tripId: createPaymentDto.tripId,
        expenseId: createPaymentDto.expenseId,
        paymentDate:
          createPaymentDto.paymentDate != null &&
          createPaymentDto.paymentDate !== ""
            ? new Date(createPaymentDto.paymentDate)
            : new Date(),
      },
    });
    return this.transformPayment(payment);
  }

  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.databaseService.payment.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
    });
    return payments.map((payment) => this.transformPayment(payment));
  }

  async findOne(id: number): Promise<PaymentResponseDto> {
    const payment = await this.databaseService.payment.findUnique({
      where: { id },
    });
    if (payment === null) {
      throw new NotFoundException(`Payment with id ${id.toString()} not found`);
    }
    return this.transformPayment(payment);
  }
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    await this.findOne(id);
    const payment = await this.databaseService.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
    return this.transformPayment(payment);
  }

  async remove(id: number): Promise<PaymentResponseDto> {
    await this.findOne(id);
    const payment = await this.databaseService.payment.update({
      where: { id },
      data: { isArchived: true },
    });
    return this.transformPayment(payment);
  }

  private transformPayment(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      title: payment.title ?? undefined,
      description: payment.description ?? undefined,
      originalAmount: Number(payment.originalAmount),
      originalCurrency: payment.originalCurrency,
      amountPLN: Number(payment.amountPLN),
      exchangeRate: Number(payment.exchangeRate),
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      isArchived: payment.isArchived,
      participantId: payment.participantId ?? undefined,
      tripId: payment.tripId ?? undefined,
      expenseId: payment.expenseId ?? undefined,
    };
  }
}
