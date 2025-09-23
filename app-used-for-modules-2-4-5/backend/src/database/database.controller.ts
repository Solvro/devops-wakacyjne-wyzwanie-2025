import { Role } from "@prisma/client";

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles/role.decorator";
import { RoleGuard } from "../auth/roles/role.guard";
import { DatabaseService } from "./database.service";
import type { DatabaseStats } from "./dto/database-stats";
import type { RequestWithDatabase } from "./dto/request-with-database.dto";

@Controller("database")
@ApiTags("database")
export class DatabaseController {
  constructor(private databaseService: DatabaseService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get database statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async getStats(@Req() request: RequestWithDatabase): Promise<DatabaseStats> {
    const stats = await this.databaseService.getStats();

    request.database = stats;

    return stats;
  }

  @Post("clear")
  @ApiOperation({ summary: "Clear all data" })
  @ApiResponse({ status: 200, description: "Data cleared successfully" })
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access-token")
  async clearAllData(): Promise<{ message: string }> {
    await this.databaseService.clearAllData();
    return { message: "All data cleared successfully" };
  }
}
