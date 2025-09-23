import { ActivityCategory } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NiceDate } from "../../validators/date.validator";
import { NiceText } from "../../validators/text.validator";

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  place?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string = new Date().toISOString();

  @NiceDate("startDate")
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string = new Date().toISOString();

  @Validate(NiceText)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tripId?: number;

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
