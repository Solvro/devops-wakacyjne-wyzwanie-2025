import { IsBoolean, IsDateString, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateParticipantDto } from "./create-participant.dto";

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  updatedAt?: string = new Date().toISOString();

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
