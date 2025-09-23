import { Queue } from "bullmq";

import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";

import { TripSummaryData } from "../summary/dto/summary-create.dto";

export interface EmailJobData {
  to: string;
  recipientName: string;
  tripSummary: TripSummaryData;
}

export interface BulkEmailJobData {
  emails: EmailJobData[];
  tripId: number;
  tripTitle: string;
}

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue("email-notifications")
    private emailQueue: Queue,
  ) {}

  async addTripSummaryEmailsJob(jobData: BulkEmailJobData) {
    const jobs = jobData.emails.map((email, index) => ({
      name: "send-trip-summary",
      data: email,
      opts: {
        attempts: 3,
        delay: index * 1000,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    }));
    await this.emailQueue.addBulk(jobs);
  }
}
