import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [DatabaseModule, UserModule],
  exports: [AuthService],
})
export class AuthModule {}
