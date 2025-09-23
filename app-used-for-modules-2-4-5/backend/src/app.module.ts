import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { ActivityController } from "./activity/activity.controller";
import { ActivityModule } from "./activity/activity.module";
import { ActivityService } from "./activity/activity.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import { CurrencyModule } from "./currency/currency.module";
import { DatabaseController } from "./database/database.controller";
import { DatabaseModule } from "./database/database.module";
import { DatabaseService } from "./database/database.service";
import { EmailModule } from "./email/email.module";
import { ExpenseController } from "./expense/expense.controller";
import { ExpenseModule } from "./expense/expense.module";
import { ExpenseService } from "./expense/expense.service";
import { ParticipantController } from "./participant/participant.controller";
import { ParticipantModule } from "./participant/participant.module";
import { ParticipantService } from "./participant/participant.service";
import { PaymentModule } from "./payment/payment.module";
import { SummaryModule } from "./summary/summary.module";
import { TripController } from "./trip/trip.controller";
import { TripModule } from "./trip/trip.module";
import { TripService } from "./trip/trip.service";
import { UserController } from "./user/user.controller";
import { UserModule } from "./user/user.module";
import { UserService } from "./user/user.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number.parseInt(process.env.REDIS_PORT ?? "6379", 10),
      },
    }),
    BullModule.registerQueue({
      name: "email-notifications",
    }),
    DatabaseModule,
    CurrencyModule,
    ParticipantModule,
    TripModule,
    ExpenseModule,
    ActivityModule,
    AuthModule,
    UserModule,
    PaymentModule,
    EmailModule,
    SummaryModule,
  ],
  controllers: [
    AppController,
    DatabaseController,
    ExpenseController,
    TripController,
    ParticipantController,
    ActivityController,
    AuthController,
    UserController,
  ],
  providers: [
    AppService,
    DatabaseService,
    ExpenseService,
    ParticipantService,
    TripService,
    ActivityService,
    AuthService,
    UserService,
  ],
})
export class AppModule {}
