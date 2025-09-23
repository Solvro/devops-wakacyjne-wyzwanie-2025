import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentService } from "./payment.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({
    status: 201,
    description: "The payment has been successfully created",
    type: PaymentResponseDto,
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({
    status: 200,
    description: "Return all payments.",
    type: [PaymentResponseDto],
  })
  async findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a payment" })
  @ApiResponse({
    status: 200,
    description: "Return the payment.",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found." })
  async findOne(@Param("id") id: string): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(Number(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a payment" })
  @ApiResponse({
    status: 200,
    description: "The payment has been successfully updated.",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found." })
  async update(
    @Param("id") id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(Number(id), updatePaymentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Archive a payment" })
  @ApiResponse({
    status: 200,
    description: "The payment has been successfully archived.",
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: "Payment not found." })
  async remove(@Param("id") id: string): Promise<PaymentResponseDto> {
    return this.paymentService.remove(Number(id));
  }
}
