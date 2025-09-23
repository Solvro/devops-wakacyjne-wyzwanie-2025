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
import { CreateTripDto } from "./dto/create-trip.dto";
import { TripResponseDto } from "./dto/trip-response.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { TripService } from "./trip.service";

@Controller("trip")
@ApiTags("trip")
export class TripController {
  constructor(private readonly tripService: TripService) {}

  private parseIncludeOptions(include?: string) {
    return include !== undefined && include.length > 0
      ? {
          participants: include.includes("participants"),
          expenses: include.includes("expenses"),
        }
      : undefined;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new trip",
    description: "Add a trip to which you can supply expenses and participants",
  })
  @ApiResponse({
    status: 201,
    description: "Trip created",
    type: TripResponseDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all trips",
    description: "Retrieve a list of trips",
  })
  @ApiResponse({
    status: 200,
    description: "List of trips retrieved successfully",
    type: [TripResponseDto],
  })
  @ApiQuery({ name: "skip", required: false, type: Number })
  @ApiQuery({ name: "take", required: false, type: Number })
  @ApiQuery({
    name: "orderBy",
    required: false,
    description: "Order by field:direction [id:asc, name:desc]",
  })
  @ApiQuery({
    name: "include",
    required: false,
    description: "Include related data [participants, expenses]",
  })
  async findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("orderBy") orderBy?: string,
    @Query("include") include?: string,
  ) {
    const {
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
    } = QueryParser.parseQueryParameters({ skip, take, orderBy });
    const includeOptions = this.parseIncludeOptions(include);
    return this.tripService.findAll({
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
      include: includeOptions,
    });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get trip by ID",
    description: "Retrieve information about a trip",
  })
  @ApiResponse({
    status: 200,
    description: "Trip details retrieved successfully",
    type: TripResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Trip not found",
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.tripService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update trip details",
    description: "Change information for an existing trip",
  })
  @ApiResponse({
    status: 200,
    description: "Trip updated successfully",
    type: TripResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Trip not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete a trip",
    description: "Remove a trip and its data",
  })
  @ApiResponse({
    status: 200,
    description: "Trip deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Trip not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.tripService.remove(id);
  }
}
