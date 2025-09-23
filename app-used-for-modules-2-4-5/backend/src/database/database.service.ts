import { PrismaClient } from "@prisma/client";

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import type { DatabaseStats } from "./dto/database-stats";

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getStats(): Promise<DatabaseStats> {
    const [users, participants, trips, expenses, activities] =
      await Promise.all([
        this.user.count(),
        this.participant.count(),
        this.trip.count(),
        this.expense.count(),
        this.activity.count(),
      ]);

    return {
      users,
      participants,
      trips,
      expenses,
      activities,
      timestamp: new Date(),
    };
  }
  async clearAllData(): Promise<void> {
    await this.expense.deleteMany();
    await this.activity.deleteMany();
    await this.participant.deleteMany();
    await this.trip.deleteMany();
    await this.user.deleteMany();
  }
}
