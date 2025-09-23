import { TripCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NiceDate } from "../../validators/date.validator";
import { NiceText } from "../../validators/text.validator";

export class CreateTripDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsEnum(TripCategory)
  category: TripCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @NiceDate("startDate")
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accommodation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Decimal)
  @IsPositive()
  travelTime?: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Decimal)
  @IsPositive()
  travelDistance?: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(NiceText)
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    isArray: true,
  })
  @IsOptional()
  participantsIds?: number[];

  @ApiPropertyOptional({
    isArray: true,
  })
  @IsOptional()
  expensesIds?: number[];
}
