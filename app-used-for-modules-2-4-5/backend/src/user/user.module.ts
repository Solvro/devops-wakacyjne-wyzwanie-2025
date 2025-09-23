import { Module, forwardRef } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { DatabaseModule } from "../database/database.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  providers: [UserService, AuthService, RoleGuard],
  exports: [UserService],
  imports: [forwardRef(() => DatabaseModule)],
  controllers: [UserController],
})
export class UserModule {}
