import { ParticipantRole, ParticipantSex } from "@prisma/client";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NiceText } from "../../validators/text.validator";

export class CreateParticipantDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  surname: string;

  @ApiProperty()
  @IsEnum(ParticipantRole)
  role: ParticipantRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(50)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  iban?: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isAdult: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string = new Date().toISOString();

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiProperty()
  @IsEnum(ParticipantSex)
  sex: ParticipantSex;

  @Validate(NiceText)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    isArray: true,
  })
  @IsOptional()
  tripsIds?: number[];

  @ApiPropertyOptional({
    isArray: true,
  })
  @IsOptional()
  expensesIds?: number[];
}
