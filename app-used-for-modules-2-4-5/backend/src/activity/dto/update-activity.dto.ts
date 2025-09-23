import { IsBoolean, IsDateString } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";

import { CreateActivityDto } from "./create-activity.dto";

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @ApiProperty()
  @IsDateString()
  updatedAt: string = new Date().toISOString();

  @ApiProperty()
  @IsBoolean()
  isArchived: boolean;
}
