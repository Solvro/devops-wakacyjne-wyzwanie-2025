import { Module } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, AuthService, RoleGuard],
  imports: [DatabaseModule, UserModule],
})
export class ActivityModule {}
