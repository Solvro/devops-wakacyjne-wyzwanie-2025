export interface ExpenseMetadata {
  id: number;
  title: string;
  recipientName: string | null;
  recipientIban: string | null;
  quantity: number | null;
  currency: string;
  amount: number | null;
  budgetLeft: number | null;
  category: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  participantId: number | null;
  tripId: number | null;
  activityId: number | null;
  amountInPLN?: number | null;
  exchangeRate?: number;
}

export function expenseToMetadata(expense: ExpenseMetadata): ExpenseMetadata {
  return {
    id: expense.id,
    title: expense.title,
    recipientName: expense.recipientName,
    recipientIban: expense.recipientIban,
    quantity: expense.quantity,
    currency: expense.currency,
    amount: expense.amount,
    budgetLeft: expense.budgetLeft,
    category: expense.category,
    note: expense.note,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    isArchived: expense.isArchived,
    participantId: expense.participantId,
    tripId: expense.tripId,
    activityId: expense.activityId,
    amountInPLN: expense.amountInPLN,
    exchangeRate: expense.exchangeRate,
  };
}
