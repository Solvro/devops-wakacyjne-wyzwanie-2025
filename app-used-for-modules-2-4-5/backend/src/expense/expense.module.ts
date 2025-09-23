import { Module } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { CurrencyModule } from "../currency/currency.module";
import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { ExpenseController } from "./expense.controller";
import { ExpenseService } from "./expense.service";

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, AuthService, RoleGuard],
  imports: [DatabaseModule, UserModule, CurrencyModule],
})
export class ExpenseModule {}
