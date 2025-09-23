import { Job } from "bullmq";

import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";

import { EmailJobData } from "./email-queue.service";
import { EmailService } from "./email.service";

@Processor("email-notifications")
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, recipientName, tripSummary } = job.data;
    try {
      await this.emailService.sendTripSummaryEmail(
        to,
        recipientName,
        tripSummary,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<EmailJobData>, error: Error) {
    this.logger.error(`Email job failed for ${job.data.to}:`, error.message);
  }
}
