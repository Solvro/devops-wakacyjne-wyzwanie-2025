import { Module, forwardRef } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { UserModule } from "../user/user.module";
import { DatabaseController } from "./database.controller";
import { DatabaseService } from "./database.service";

@Module({
  providers: [DatabaseService, AuthService, RoleGuard],
  controllers: [DatabaseController],
  exports: [DatabaseService],
  imports: [forwardRef(() => UserModule)],
})
export class DatabaseModule {}
