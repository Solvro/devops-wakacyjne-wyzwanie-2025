import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

import { NicePassword } from "../../validators/password.validator";
import { NiceText } from "../../validators/text.validator";

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf(
    (o: UpdateUserDto) => o.password !== "" && o.password !== undefined,
  )
  @NicePassword()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @NiceText()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
