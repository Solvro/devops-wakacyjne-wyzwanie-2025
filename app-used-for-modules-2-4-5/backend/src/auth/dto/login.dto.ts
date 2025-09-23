import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { NicePassword } from "../../validators/password.validator";

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  email: string;

  @Validate(NicePassword)
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
