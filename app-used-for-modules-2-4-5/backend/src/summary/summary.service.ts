import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { CurrencyService } from "../currency/currency.service";
import { DatabaseService } from "../database/database.service";
import { EmailQueueService } from "../email/email-queue.service";
import { TripSummaryData } from "./dto/summary-create.dto";
import {
  TripCloseResponseDto,
  TripSummaryResponseDto,
} from "./dto/summary-response.dto";

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private database: DatabaseService,
    private emailQueueService: EmailQueueService,
    private currencyService: CurrencyService,
  ) {}

  async closeTripWithEmail(tripId: number): Promise<TripCloseResponseDto> {
    const trip = await this.database.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: { isArchived: false },
        },
        expenses: {
          where: { isArchived: false },
        },
      },
    });
    if (trip === null) {
      throw new NotFoundException(
        `Trip with ID ${tripId.toString()} not found`,
      );
    }
    const summary = await this.calculateTripSummary(trip);
    const emailData: TripSummaryData = {
      tripId: summary.tripId,
      tripTitle: summary.tripTitle,
      destination: summary.destination,
      startDate: summary.startDate,
      endDate: summary.endDate,
      totalExpenses: summary.totalExpenses,
      expensesByCurrency: summary.expensesByCurrency,
      participantExpenses: summary.participantExpenses,
      paymentSummary: summary.paymentSummary,
    };
    const validParticipants = trip.participants.filter(
      (participant) =>
        participant.email !== null && participant.email.length > 0,
    );
    const emailJobs = validParticipants
      .map((participant) => {
        const email = participant.email;
        if (email !== null) {
          return {
            to: email,
            recipientName: `${participant.name} ${participant.surname}`,
            tripSummary: emailData,
          };
        }
        return null;
      })
      .filter((job): job is NonNullable<typeof job> => job !== null);
    if (emailJobs.length > 0) {
      await this.emailQueueService.addTripSummaryEmailsJob({
        emails: emailJobs,
        tripId,
        tripTitle: trip.title,
      });
    }
    await this.database.trip.update({
      where: { id: tripId },
      data: { isArchived: true },
    });
    return {
      message: `Trip "${trip.title}" has been closed and email notifications sent.`,
      emailsSent: validParticipants.length,
      summary,
    };
  }

  async calculateSummary(tripId: number): Promise<TripSummaryResponseDto> {
    const trip = await this.database.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: { isArchived: false },
        },
        expenses: {
          where: { isArchived: false },
        },
      },
    });
    if (trip === null) {
      throw new NotFoundException(
        `Trip with ID ${tripId.toString()} not found`,
      );
    }
    return await this.calculateTripSummary(trip);
  }

  private async calculateTripSummary(trip: {
    id: number;
    title: string;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
    expenses: {
      id: number;
      amount: unknown;
      currency: string;
      participantId: number | null;
    }[];
    participants: {
      id: number;
      name: string;
      surname: string;
      email: string | null;
    }[];
  }): Promise<TripSummaryResponseDto> {
    let totalExpensesPLN = 0;
    const expensesByCurrency: Record<string, number> = {};
    for (const expense of trip.expenses) {
      const currency = expense.currency;
      const amount =
        expense.amount !== null && expense.amount !== undefined
          ? Number(expense.amount)
          : 0;
      if (!expensesByCurrency[currency]) {
        expensesByCurrency[currency] = 0;
      }
      expensesByCurrency[currency] += amount;
      try {
        const convertedAmount = await this.currencyService.convertToPLN(
          amount,
          currency,
        );
        totalExpensesPLN += convertedAmount;
      } catch (error) {
        this.logger.error(`Currency conversion failed for ${currency}`, error);
        totalExpensesPLN += amount;
      }
    }
    const participantExpenseMap = new Map<
      number,
      {
        participantId: number;
        name: string;
        surname: string;
        email: string;
        totalSpent: number;
        expenseCount: number;
      }
    >();
    for (const participant of trip.participants) {
      participantExpenseMap.set(participant.id, {
        participantId: participant.id,
        name: participant.name,
        surname: participant.surname,
        email: participant.email ?? "",
        totalSpent: 0,
        expenseCount: 0,
      });
    }
    for (const expense of trip.expenses) {
      if (
        expense.participantId !== null &&
        participantExpenseMap.has(expense.participantId)
      ) {
        const participantData = participantExpenseMap.get(
          expense.participantId,
        );
        if (participantData !== undefined) {
          const amount =
            expense.amount !== null && expense.amount !== undefined
              ? Number(expense.amount)
              : 0;
          try {
            const convertedAmount = await this.currencyService.convertToPLN(
              amount,
              expense.currency,
            );
            participantData.totalSpent += convertedAmount;
            participantData.expenseCount += 1;
          } catch (error) {
            this.logger.error(
              `Currency conversion failed for ${expense.currency}`,
              error,
            );
            participantData.totalSpent += amount;
            participantData.expenseCount += 1;
          }
        }
      }
    }
    const participantExpenses = [...participantExpenseMap.values()];
    const averagePerPerson =
      totalExpensesPLN / Math.max(trip.participants.length, 1);
    const paymentSummary: { from: string; to: string; amount: number }[] = [];
    const balances = participantExpenses.map((p) => ({
      name: `${p.name} ${p.surname}`,
      balance: p.totalSpent - averagePerPerson,
    }));
    const creditors = balances
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const debtors = balances
      .filter((b) => b.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    for (const debtor of debtors) {
      let remainingDebt = Math.abs(debtor.balance);
      for (const creditor of creditors) {
        if (remainingDebt <= 0.01 || creditor.balance <= 0.01) {
          break;
        }
        const paymentAmount = Math.min(remainingDebt, creditor.balance);
        if (paymentAmount > 0.01) {
          paymentSummary.push({
            from: debtor.name,
            to: creditor.name,
            amount: paymentAmount,
          });
          remainingDebt -= paymentAmount;
          creditor.balance -= paymentAmount;
        }
      }
    }
    return {
      tripId: trip.id,
      tripTitle: trip.title,
      destination: trip.destination ?? undefined,
      startDate: trip.startDate ?? undefined,
      endDate: trip.endDate ?? undefined,
      totalExpenses: totalExpensesPLN,
      expensesByCurrency,
      participantExpenses,
      paymentSummary,
    };
  }
}
