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
import { CreateParticipantDto } from "./dto/create-participant.dto";
import { ParticipantResponseDto } from "./dto/participant-response.dto";
import { UpdateParticipantDto } from "./dto/update-participant.dto";
import { ParticipantService } from "./participant.service";

@Controller("participant")
@ApiTags("participant")
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  private parseIncludeOptions(include?: string) {
    return include !== undefined && include.length > 0
      ? {
          trips: include.includes("trips"),
          expenses: include.includes("expenses"),
        }
      : undefined;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new participant",
    description: "Add a participant to which you can supply expenses and trips",
  })
  @ApiResponse({
    status: 201,
    description: "Participant created",
    type: ParticipantResponseDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantService.create(createParticipantDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all participants",
    description: "Retrieve a list of participants",
  })
  @ApiResponse({
    status: 200,
    description: "List of participants retrieved successfully",
    type: [ParticipantResponseDto],
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
    description: "Include related data [trips, expenses]",
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
    return this.participantService.findAll({
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
      include: includeOptions,
    });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get participant by ID",
    description: "Retrieve detailed information about a participant",
  })
  @ApiResponse({
    status: 200,
    description: "Participant details retrieved successfully",
    type: ParticipantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Participant not found",
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.participantService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update participant details",
    description: "Change information for an existing participant",
  })
  @ApiResponse({
    status: 200,
    description: "Participant updated successfully",
    type: ParticipantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Participant not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.participantService.update(id, updateParticipantDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete a participant",
    description: "Remove a participant and its data",
  })
  @ApiResponse({
    status: 200,
    description: "Participant deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Participant not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.participantService.remove(id);
  }
}
