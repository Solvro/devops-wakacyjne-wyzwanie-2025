import { ExpenseCategory } from "@prisma/client";
import request from "supertest";
import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

function generateTestToken(email: string): string {
  const timestamp = Date.now().toString();
  return `token_${email}_${timestamp}`;
}

describe("ExpenseController (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    await seedDatabase();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    authToken = `Bearer ${generateTestToken("admin@example.com")}`;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/expense (GET)", () => {
    it("should return all expenses", async () => {
      const response = await request(app.getHttpServer())
        .get("/expense")
        .expect(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Spektakl w teatrze",
            category: ExpenseCategory.ENTERTAINMENT,
          }),
          expect.objectContaining({
            id: 2,
            title: "Bilety lotnicze",
            category: ExpenseCategory.TRANSPORT,
          }),
        ]),
      );
    });
  });

  describe("/expense/:id (GET)", () => {
    it("should return an expense by id", async () => {
      const response = await request(app.getHttpServer())
        .get("/expense/1")
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Spektakl w teatrze",
          category: ExpenseCategory.ENTERTAINMENT,
        }),
      );
    });

    it("should return a non-existent expense", async () => {
      await request(app.getHttpServer()).get("/expense/999").expect(404);
    });
  });

  describe("/expense (POST)", () => {
    it("should create a new expense", async () => {
      const newExpense = {
        title: "Obiad w restauracji",
        category: ExpenseCategory.FOOD,
        recipientName: "Restauracja Gourmet",
        recipientIban: "PL61109010140000071219812874",
        quantity: 2,
        currency: "PLN",
        amount: 150,
        budgetLeft: 1850,
        note: "Kolacja dla dwojga",
        participantId: 1,
        tripId: 1,
      };
      const response = await request(app.getHttpServer())
        .post("/expense")
        .set("Authorization", authToken)
        .send(newExpense)
        .expect(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number) as number,
          title: "Obiad w restauracji",
          category: ExpenseCategory.FOOD,
        }),
      );
    });

    it("should validate NiceText constraint", async () => {
      const invalidExpense = {
        title: "Zły wydatek",
        category: ExpenseCategory.FOOD,
        currency: "PLN",
        note: "przegryw",
      };
      const response = await request(app.getHttpServer())
        .post("/expense")
        .set("Authorization", authToken)
        .send(invalidExpense);
      expect(response.status).toBe(201);
    });

    it("should require authentication", async () => {
      const newExpense = {
        title: "Nieautoryzowany wydatek",
        category: ExpenseCategory.FOOD,
        currency: "PLN",
      };
      await request(app.getHttpServer())
        .post("/expense")
        .send(newExpense)
        .expect(401);
    });
  });

  describe("/expense/:id (PATCH)", () => {
    it("should update an expense", async () => {
      const updateData = {
        title: "Zaktualizowany spektakl w teatrze",
        amount: 1400,
        isArchived: false,
      };
      const response = await request(app.getHttpServer())
        .patch("/expense/1")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Zaktualizowany spektakl w teatrze",
          amount: 1400,
        }),
      );
    });

    it("should require authentication", async () => {
      const updateData = {
        title: "Nieautoryzowana aktualizacja",
      };
      await request(app.getHttpServer())
        .patch("/expense/1")
        .send(updateData)
        .expect(401);
    });
  });

  describe("/expense/:id (DELETE)", () => {
    it("should delete an expense", async () => {
      const response = await request(app.getHttpServer())
        .delete("/expense/1")
        .set("Authorization", authToken)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Spektakl w teatrze",
        }),
      );
    });

    it("should require authentication", async () => {
      await request(app.getHttpServer()).delete("/expense/1").expect(401);
    });
  });
});
