import { Module } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { RoleGuard } from "../auth/roles/role.guard";
import { DatabaseModule } from "../database/database.module";
import { UserModule } from "../user/user.module";
import { ParticipantController } from "./participant.controller";
import { ParticipantService } from "./participant.service";

@Module({
  controllers: [ParticipantController],
  providers: [ParticipantService, AuthService, RoleGuard],
  imports: [DatabaseModule, UserModule],
})
export class ParticipantModule {}
