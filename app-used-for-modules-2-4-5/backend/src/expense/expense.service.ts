import { Expense, Prisma } from "@prisma/client";

import { Injectable, NotFoundException } from "@nestjs/common";

import { CurrencyExpenseService } from "../currency/currency-expense.service";
import { DatabaseService } from "../database/database.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseMetadata } from "./dto/expense-metadata.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";

interface ExpenseOptions {
  where?: Prisma.ExpenseWhereInput;
  orderBy?: Prisma.ExpenseOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

@Injectable()
export class ExpenseService {
  constructor(
    private database: DatabaseService,
    private currencyExpense: CurrencyExpenseService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const expense = await this.database.expense.create({
      data: {
        title: createExpenseDto.title,
        category: createExpenseDto.category,
        recipientName: createExpenseDto.recipientName,
        recipientIban: createExpenseDto.recipientIban,
        quantity: createExpenseDto.quantity,
        currency: createExpenseDto.currency,
        amount: createExpenseDto.amount,
        budgetLeft: createExpenseDto.budgetLeft,
        note: createExpenseDto.note,
        participantId: createExpenseDto.participantId,
        tripId: createExpenseDto.tripId,
      },
    });

    return this.transformExpense(expense);
  }

  async findAll(options?: ExpenseOptions) {
    const expenses = await this.database.expense.findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    });
    const transformedExpenses = expenses.map((expense) =>
      this.transformExpense(expense),
    );
    return await Promise.all(
      transformedExpenses.map(
        async (expense) => await this.addCurrencyInfo(expense),
      ),
    );
  }

  async findOne(id: number) {
    const expense = await this.database.expense.findUnique({ where: { id } });
    if (expense === null) {
      throw new NotFoundException(`Expense with id ${String(id)} not found`);
    }
    return await this.addCurrencyInfo(this.transformExpense(expense));
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.database.expense.update({
      where: { id },
      data: updateExpenseDto,
    });
    return await this.addCurrencyInfo(this.transformExpense(expense));
  }

  async remove(id: number) {
    const expense = await this.database.expense.delete({ where: { id } });
    return this.transformExpense(expense);
  }

  private async addCurrencyInfo(
    expense: ExpenseMetadata,
  ): Promise<ExpenseMetadata> {
    if (expense.amount !== null) {
      const rateInfo = await this.currencyExpense.getExchangeRateInfo(
        expense.currency,
      );
      expense.exchangeRate = rateInfo.rate;
      expense.amountInPLN =
        await this.currencyExpense.convertExpenseAmountToPLN(
          expense.amount,
          expense.currency,
        );
    }
    return expense;
  }

  private transformExpense(expense: Expense): ExpenseMetadata {
    return {
      id: expense.id,
      title: expense.title,
      recipientName: expense.recipientName,
      recipientIban: expense.recipientIban,
      quantity: expense.quantity,
      currency: expense.currency,
      amount: expense.amount === null ? null : Number(expense.amount),
      budgetLeft:
        expense.budgetLeft === null ? null : Number(expense.budgetLeft),
      category: expense.category,
      note: expense.note,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      isArchived: expense.isArchived,
      participantId: expense.participantId,
      tripId: expense.tripId,
      activityId: expense.activityId,
      amountInPLN: null,
    };
  }
}
