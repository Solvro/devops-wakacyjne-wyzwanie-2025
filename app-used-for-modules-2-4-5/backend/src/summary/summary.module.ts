import { Module } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { CurrencyModule } from "../currency/currency.module";
import { DatabaseModule } from "../database/database.module";
import { EmailModule } from "../email/email.module";
import { UserModule } from "../user/user.module";
import { SummaryController } from "./summary.controller";
import { SummaryService } from "./summary.service";

@Module({
  controllers: [SummaryController],
  providers: [SummaryService, AuthService, RoleGuard],
  imports: [DatabaseModule, EmailModule, UserModule, CurrencyModule],
  exports: [SummaryService],
})
export class SummaryModule {}
