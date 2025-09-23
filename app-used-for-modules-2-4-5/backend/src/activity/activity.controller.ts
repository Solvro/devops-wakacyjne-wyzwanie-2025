import { Role } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles/role.decorator";
import { RoleGuard } from "../auth/roles/role.guard";
import { QueryParser } from "../parsers/parser";
import { ActivityService } from "./activity.service";
import { ActivityResponseDto } from "./dto/activity-response.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Controller("activity")
@ApiTags("activity")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new activity",
    description: "Add an activity",
  })
  @ApiResponse({
    status: 201,
    description: "Activity created",
    type: ActivityResponseDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all activities",
    description: "Retrieve a list of activities",
  })
  @ApiResponse({
    status: 200,
    description: "List of activities retrieved successfully",
    type: [ActivityResponseDto],
  })
  @ApiQuery({ name: "skip", required: false, type: Number })
  @ApiQuery({ name: "take", required: false, type: Number })
  @ApiQuery({
    name: "orderBy",
    required: false,
    description: "Order by field:direction [amount:desc, createdAt:asc]",
  })
  async findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("orderBy") orderBy?: string,
  ) {
    const {
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
    } = QueryParser.parseQueryParameters({ skip, take, orderBy });

    return this.activityService.findAll({
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
    });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get activity by ID",
    description: "Retrieve detailed information about an activity",
  })
  @ApiResponse({
    status: 200,
    description: "Activity details retrieved successfully",
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Activity not found",
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.activityService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update activity details",
    description: "Change information for an existing activity",
  })
  @ApiResponse({
    status: 200,
    description: "Activity updated successfully",
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Activity not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth("access-token")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete an activity",
    description: "Remove an activity and its data",
  })
  @ApiResponse({
    status: 200,
    description: "Activity deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Activity not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.activityService.remove(id);
  }
}
