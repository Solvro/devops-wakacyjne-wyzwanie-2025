import { ExpenseCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NiceText } from "../../validators/text.validator";

export class CreateExpenseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  recipientIban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiProperty()
  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @Type(() => Decimal)
  amount?: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Decimal)
  budgetLeft?: Decimal;

  @Validate(NiceText)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  participantId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tripId?: number;
}
