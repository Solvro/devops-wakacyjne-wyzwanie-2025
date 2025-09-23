import { Module } from "@nestjs/common";

import { CurrencyModule } from "../currency/currency.module";
import { DatabaseModule } from "../database/database.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  imports: [DatabaseModule, CurrencyModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
