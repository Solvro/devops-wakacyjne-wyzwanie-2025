import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentResponseDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  originalAmount: number;

  @ApiProperty()
  originalCurrency: string;

  @ApiProperty()
  amountPLN: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isArchived: boolean;

  @ApiPropertyOptional()
  participantId?: number;

  @ApiPropertyOptional()
  tripId?: number;

  @ApiPropertyOptional()
  expenseId?: number;
}
