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
import { QueryParser } from "../parsers/parser";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseResponseDto } from "./dto/expense-response.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseService } from "./expense.service";

@Controller("expense")
@ApiTags("expense")
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new expense",
    description: "Add an expense to which you supply trip and participant",
  })
  @ApiResponse({
    status: 201,
    description: "Expense created",
    type: ExpenseResponseDto,
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all expenses",
    description: "Retrieve a list of expenses",
  })
  @ApiResponse({
    status: 200,
    description: "List of expenses retrieved successfully",
    type: [ExpenseResponseDto],
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

    return this.expenseService.findAll({
      skip: parsedSkip,
      take: parsedTake,
      orderBy: parsedOrderBy,
    });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get expense by ID",
    description: "Retrieve detailed information about an expense",
  })
  @ApiResponse({
    status: 200,
    description: "Expense details retrieved successfully",
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Expense not found",
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.expenseService.findOne(id);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update expense details",
    description: "Change information for an existing expense",
  })
  @ApiResponse({
    status: 200,
    description: "Expense updated successfully",
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Expense not found",
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Delete an expense",
    description: "Remove an expense and its data",
  })
  @ApiResponse({
    status: 200,
    description: "Expense deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Expense not found",
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.expenseService.remove(id);
  }
}
