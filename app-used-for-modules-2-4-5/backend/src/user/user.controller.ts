import { Role, User } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
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
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserMetadata } from "./dto/user-metadata.dto";
import { UserService } from "./user.service";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({
    status: 200,
    description: "List of users retrieved successfully",
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async findAll(): Promise<UserMetadata[]> {
    return this.userService.findAll();
  }

  @Get(":email")
  @ApiOperation({ summary: "Get user" })
  @ApiParam({ name: "email", description: "User email" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  async findOne(@Param("email") email: string): Promise<User | null> {
    return this.userService.findOne(email);
  }

  @Patch(":email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden action",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD, Role.USER)
  @ApiBearerAuth("access-token")
  async update(
    @Param("email") email: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: { user: { email: string; role: Role } },
  ): Promise<UserMetadata> {
    return this.userService.update(email, updateUserDto, request.user);
  }

  @Patch(":email/archive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Archive user" })
  @ApiResponse({
    status: 200,
    description: "User archived successfully",
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async archive(@Param("email") email: string): Promise<UserMetadata> {
    return this.userService.archive(email);
  }

  @Patch(":email/dearchive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Dearchive user" })
  @ApiResponse({
    status: 200,
    description: "User archived successfully",
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.TRIPCOORD)
  @ApiBearerAuth("access-token")
  async dearchive(@Param("email") email: string): Promise<UserMetadata> {
    return this.userService.dearchive(email);
  }

  @Delete(":email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({
    status: 204,
    description: "User deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access-token")
  async remove(@Param("email") email: string): Promise<void> {
    return this.userService.remove(email);
  }
}
