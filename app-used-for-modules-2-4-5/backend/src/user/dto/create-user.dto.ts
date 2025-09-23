import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NicePassword } from "../../validators/password.validator";
import { NiceText } from "../../validators/text.validator";

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(200)
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Validate(NicePassword)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Validate(NiceText)
  note?: string;
}
