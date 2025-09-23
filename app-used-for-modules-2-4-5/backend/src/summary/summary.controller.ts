import { Role } from "@prisma/client";

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles/role.decorator";
import { RoleGuard } from "../auth/roles/role.guard";
import {
  TripCloseResponseDto,
  TripSummaryResponseDto,
} from "./dto/summary-response.dto";
import { SummaryService } from "./summary.service";

@ApiTags("summary")
@Controller("summary")
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get("trip/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get trip summary",
    description: "Calculate and return summary for a trip",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Trip ID",
  })
  @ApiResponse({
    status: 200,
    description: "Trip summary calculated successfully",
    type: TripSummaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Trip not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async getTripSummary(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<TripSummaryResponseDto> {
    return this.summaryService.calculateSummary(id);
  }

  @Post("trip/:id/close")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Close trip and send email notifications",
    description: "Close a trip, calculate expense summaries and send emails",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Trip ID",
  })
  @ApiResponse({
    status: 200,
    description: "Trip closed successfully and emails sent",
    type: TripCloseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Trip not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async closeTrip(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<TripCloseResponseDto> {
    return this.summaryService.closeTripWithEmail(id);
  }
}
