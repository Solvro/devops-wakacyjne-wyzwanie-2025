import { IsBoolean, IsDateString, IsInt } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { CreateParticipantDto } from "./create-participant.dto";

export class ParticipantResponseDto extends CreateParticipantDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsDateString()
  updatedAt: string = new Date().toISOString();

  @ApiProperty()
  @IsDateString()
  createdAt: string = new Date().toISOString();

  @ApiProperty()
  @IsBoolean()
  isArchived: boolean;
}
