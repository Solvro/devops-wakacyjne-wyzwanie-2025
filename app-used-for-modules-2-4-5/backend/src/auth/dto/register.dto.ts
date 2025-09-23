import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

import { NiceText } from "../../validators/text.validator";
import { LoginDto } from "./login.dto";

export class RegisterDto extends LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  username?: string;

  @Validate(NiceText)
  @IsOptional()
  @IsString()
  note?: string;
}
