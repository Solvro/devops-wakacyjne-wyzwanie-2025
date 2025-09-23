import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { EmailProcessor } from "./email-processor";
import { EmailQueueService } from "./email-queue.service";
import { EmailService } from "./email.service";

@Module({
  imports: [BullModule.registerQueue({ name: "email-notifications" })],
  providers: [EmailService, EmailQueueService, EmailProcessor],
  exports: [EmailService, EmailQueueService, EmailProcessor],
})
export class EmailModule {}
