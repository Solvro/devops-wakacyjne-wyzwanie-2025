import { IsBoolean, IsDateString, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateTripDto } from "./create-trip.dto";

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  updatedAt?: string = new Date().toISOString();

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
