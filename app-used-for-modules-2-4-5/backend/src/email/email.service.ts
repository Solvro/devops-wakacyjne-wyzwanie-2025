import * as nodemailer from "nodemailer";

import { Injectable, Logger } from "@nestjs/common";

import { TripSummaryData } from "../summary/dto/summary-create.dto";
import { EmailData } from "./dto/email-create.dto";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
      port: Number.parseInt(process.env.EMAIL_PORT ?? "587", 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER ?? "",
        pass: process.env.EMAIL_PASS ?? "",
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const emailUser = process.env.EMAIL_USER ?? "";
      const emailPass = process.env.EMAIL_PASS ?? "";
      if (
        emailUser === "" ||
        emailPass === "" ||
        emailUser === "your_email@gmail.com" ||
        emailPass === "your_app_password_here" ||
        emailUser === "test@example.com" ||
        emailPass === "test-password" ||
        process.env.NODE_ENV === "test"
      ) {
        this.logger.warn(
          `Email configuration not set up properly or in test mode. Would send email to ${emailData.to}:`,
        );
        this.logger.log(`Subject: ${emailData.subject}`);
        this.logger.log(`Content:\n${emailData.text ?? "No content"}`);
        return;
      }
      const mailOptions = {
        from: process.env.EMAIL_FROM ?? "noreply@budzetownik.com",
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send email to: ${emailData.to}`, error);
      throw error;
    }
  }

  async sendTripSummaryEmail(
    participantEmail: string,
    participantName: string,
    tripSummary: TripSummaryData,
  ): Promise<void> {
    try {
      const subject = `Trip Summary: ${tripSummary.tripTitle}`;
      const text = this.generateTripSummaryText(participantName, tripSummary);
      await this.sendEmail({
        to: participantEmail,
        subject,
        text,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send trip summary email to: ${participantEmail}`,
        error,
      );
      throw error;
    }
  }

  private generateTripSummaryText(
    participantName: string,
    summary: TripSummaryData,
  ): string {
    let text = `Trip Summary: ${summary.tripTitle}\n\n`;
    text += `Hello ${participantName},\n\n`;
    text += `Your trip "${summary.tripTitle}" has been closed.\n\n`;
    text += `TRIP DETAILS:\n`;
    if (summary.destination !== undefined && summary.destination.length > 0) {
      text += `Destination: ${summary.destination}\n`;
    }
    if (summary.startDate !== undefined) {
      const startDate = new Date(summary.startDate);
      text += `Start Date: ${startDate.toLocaleDateString()}\n`;
    }
    if (summary.endDate !== undefined) {
      const endDate = new Date(summary.endDate);
      text += `End Date: ${endDate.toLocaleDateString()}\n`;
    }
    text += `\n`;
    text += `EXPENSE SUMMARY:\n`;
    text += `Total Trip Expenses: ${summary.totalExpenses.toFixed(2)} PLN\n\n`;
    text += `Expenses by Currency:\n`;
    for (const [currency, amount] of Object.entries(
      summary.expensesByCurrency,
    )) {
      text += `- ${currency}: ${amount.toFixed(2)}\n`;
    }
    text += `\n`;
    text += `PARTICIPANT EXPENSES:\n`;
    for (const participant of summary.participantExpenses) {
      text += `- ${participant.name} ${participant.surname}: ${participant.totalSpent.toFixed(2)} PLN (${String(participant.expenseCount)} expenses)\n`;
    }
    text += `\n`;
    if (summary.paymentSummary.length > 0) {
      text += `SUMMARY:\n`;
      text += `To balance the expenses, here are the payments:\n`;
      for (const payment of summary.paymentSummary) {
        text += `- ${payment.from} should pay ${payment.to}: ${payment.amount.toFixed(2)} PLN\n`;
      }
      text += `\n`;
    }
    text += `This email was sent automatically. Please do not reply.\n`;
    return text;
  }
}
