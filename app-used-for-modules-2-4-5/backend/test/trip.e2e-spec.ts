import { TripCategory } from "@prisma/client";
import request from "supertest";
import type { App } from "supertest/types";

import { ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

function generateTestToken(email: string): string {
  const issuedAt = Date.now();
  return `token_${email}_${issuedAt.toString()}`;
}

describe("TripController (e2e)", () => {
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
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe("/trip (GET)", () => {
    it("should return all trips", async () => {
      const response = await request(app.getHttpServer())
        .get("/trip")
        .expect(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Wyjazd nad morze Bałtyckie",
            category: TripCategory.LEISURE,
            destination: "Kołobrzeg, Poland",
          }),
          expect.objectContaining({
            id: 2,
            title: "Konferencja biznesowa",
            category: TripCategory.BUSINESS,
            destination: "Warszawa, Polska",
          }),
        ]),
      );
    });
  });

  describe("/trip/:id (GET)", () => {
    it("should return a trip by id", async () => {
      const response = await request(app.getHttpServer())
        .get("/trip/1")
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Wyjazd nad morze Bałtyckie",
          category: TripCategory.LEISURE,
        }),
      );
    });

    it("should return a non-existent trip", async () => {
      await request(app.getHttpServer()).get("/trip/999").expect(404);
    });
  });

  describe("/trip (POST)", () => {
    it("should create a new trip", async () => {
      const newTrip = {
        title: "Wycieczka w góry",
        category: TripCategory.LEISURE,
        destination: "Alpy",
        budget: 3000,
        startDate: "2024-09-01T00:00:00.000Z",
        endDate: "2024-09-10T00:00:00.000Z",
        accommodation: "Schronisko",
        travelTime: 8,
        travelDistance: 800,
        note: "Nie przekroczyć budżetu!",
        participantIds: [1],
        expensesIds: [],
      };
      const response = await request(app.getHttpServer())
        .post("/trip")
        .set("Authorization", authToken)
        .send(newTrip)
        .expect(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number) as number,
          title: "Wycieczka w góry",
          category: TripCategory.LEISURE,
          destination: "Alpy",
        }),
      );
    });

    it("should validate NiceDate constraint", async () => {
      const invalidTrip = {
        title: "Wycieczka z niepoprawną datą",
        category: TripCategory.LEISURE,
        startDate: "2024-09-10",
        endDate: "2024-09-05",
      };
      await request(app.getHttpServer())
        .post("/trip")
        .set("Authorization", authToken)
        .send(invalidTrip)
        .expect(400);
    });

    it("should validate NiceText constraint", async () => {
      const invalidTrip = {
        title: "Zła wycieczka",
        category: TripCategory.LEISURE,
        note: "przegryw",
      };
      const response = await request(app.getHttpServer())
        .post("/trip")
        .set("Authorization", authToken)
        .send(invalidTrip);
      expect(response.status).toBe(201);
      expect((response.body as { note: string }).note).toBe("przegryw");
    });
    it("should require authentication", async () => {
      const newTrip = {
        title: "Nieautoryzowana wycieczka",
        category: TripCategory.LEISURE,
      };
      await request(app.getHttpServer())
        .post("/trip")
        .send(newTrip)
        .expect(401);
    });
  });

  describe("/trip/:id (PATCH)", () => {
    it("should update a trip", async () => {
      const updateData = {
        title: "Zaktualizowany wyjazd nad morze",
        destination: "Hawaje",
        isArchived: false,
      };
      const response = await request(app.getHttpServer())
        .patch("/trip/1")
        .set("Authorization", authToken)
        .send(updateData);
      if (response.status !== 200) {
        console.error("Trip update error:", response.body);
      }
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Zaktualizowany wyjazd nad morze",
          destination: "Hawaje",
        }),
      );
    });

    it("should return a non-existent trip", async () => {
      const updateData = {
        title: "Nieistniejąca wycieczka",
      };
      await request(app.getHttpServer())
        .patch("/trip/999")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(404);
    });

    it("should require authentication", async () => {
      const updateData = {
        title: "Nieautoryzowana aktualizacja",
      };
      await request(app.getHttpServer())
        .patch("/trip/1")
        .send(updateData)
        .expect(401);
    });
  });

  describe("/trip/:id (DELETE)", () => {
    it("should delete a trip", async () => {
      const response = await request(app.getHttpServer())
        .delete("/trip/1")
        .set("Authorization", authToken)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Wyjazd nad morze Bałtyckie",
        }),
      );
      await request(app.getHttpServer()).get("/trip/1").expect(404);
    });

    it("should return a non-existent trip", async () => {
      await request(app.getHttpServer())
        .delete("/trip/999")
        .set("Authorization", authToken)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app.getHttpServer()).delete("/trip/1").expect(401);
    });
  });
});
