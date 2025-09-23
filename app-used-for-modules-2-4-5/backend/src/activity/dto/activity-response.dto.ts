import { IsBoolean, IsDateString, IsInt } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { CreateActivityDto } from "./create-activity.dto";

export class ActivityResponseDto extends CreateActivityDto {
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
