export interface TripSummaryData {
  tripId: number;
  tripTitle: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  totalExpenses: number;
  expensesByCurrency: Record<string, number>;
  participantExpenses: {
    participantId: number;
    name: string;
    surname: string;
    email: string;
    totalSpent: number;
    expenseCount: number;
  }[];
  paymentSummary: {
    from: string;
    to: string;
    amount: number;
  }[];
}
