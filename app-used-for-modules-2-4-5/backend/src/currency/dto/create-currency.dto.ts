import {
  IsBoolean,
  IsDecimal,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCurrencyDto {
  @ApiProperty()
  @IsString()
  @Length(3, 3)
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDecimal()
  currentRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
