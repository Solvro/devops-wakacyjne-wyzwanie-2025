import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ParticipantExpenseDto {
  @ApiProperty()
  participantId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  expenseCount: number;
}

export class PaymentSummaryDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  amount: number;
}

export class TripSummaryResponseDto {
  @ApiProperty()
  tripId: number;

  @ApiProperty()
  tripTitle: string;

  @ApiPropertyOptional()
  destination?: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty({})
  expensesByCurrency: Record<string, number>;

  @ApiProperty({
    type: ParticipantExpenseDto,
    isArray: true,
  })
  participantExpenses: ParticipantExpenseDto[];

  @ApiProperty({
    type: PaymentSummaryDto,
    isArray: true,
  })
  paymentSummary: PaymentSummaryDto[];
}

export class TripCloseResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  emailsSent: number;

  @ApiProperty({ type: TripSummaryResponseDto })
  summary: TripSummaryResponseDto;
}
