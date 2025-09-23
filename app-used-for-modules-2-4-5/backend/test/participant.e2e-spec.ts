import { ParticipantRole, ParticipantSex } from "@prisma/client";
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

describe("ParticipantController (e2e)", () => {
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

  describe("/participant (GET)", () => {
    it("should return all participants", async () => {
      const response = await request(app.getHttpServer())
        .get("/participant")
        .expect(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: "Adam",
            surname: "Nowak",
            role: ParticipantRole.PARTICIPANT,
          }),
          expect.objectContaining({
            id: 2,
            name: "Joanna",
            surname: "Nowak",
            role: ParticipantRole.GUIDE,
          }),
        ]),
      );
    });
  });

  describe("/participant/:id (GET)", () => {
    it("should return a participant by id", async () => {
      const response = await request(app.getHttpServer())
        .get("/participant/1")
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          name: "Adam",
          surname: "Nowak",
        }),
      );
    });

    it("should NOT require authentication", async () => {
      await request(app.getHttpServer()).get("/participant/1").expect(200);
    });
  });

  describe("/participant (POST)", () => {
    it("should create a new participant", async () => {
      const newParticipant = {
        name: "Anna",
        surname: "Kowalska",
        role: ParticipantRole.PARTICIPANT,
        email: "anna.kowalska@imejl.pl",
        phone: "+48123456789",
        address: "ul. Główna 12, 00-001 Warszawa",
        iban: "PL27114020040000300201355387",
        isAdult: true,
        dateOfBirth: "1995-03-20T00:00:00.000Z",
        placeOfBirth: "Kraków",
        sex: ParticipantSex.FEMALE,
        note: "Nowy uczestnik",
        tripsIds: [1],
        expensesIds: [],
      };
      const response = await request(app.getHttpServer())
        .post("/participant")
        .set("Authorization", authToken)
        .send(newParticipant)
        .expect(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number) as number,
          name: "Anna",
          surname: "Kowalska",
          email: "anna.kowalska@imejl.pl",
        }),
      );
    });

    it("should validate NiceText constraint", async () => {
      const invalidParticipant = {
        name: "Robert",
        surname: "Kowalski",
        role: ParticipantRole.PARTICIPANT,
        isAdult: true,
        sex: ParticipantSex.MALE,
        note: "przegryw",
      };
      const response = await request(app.getHttpServer())
        .post("/participant")
        .set("Authorization", authToken)
        .send(invalidParticipant);
      expect(response.status).toBe(201);
    });
  });

  describe("/participant/:id (PATCH)", () => {
    it("should update a participant", async () => {
      const updateData = {
        name: "Adaś",
        email: "adam.nowy@imejl.pl",
        isArchived: false,
      };
      const response = await request(app.getHttpServer())
        .patch("/participant/1")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          name: "Adaś",
          email: "adam.nowy@imejl.pl",
        }),
      );
    });
  });

  describe("/participant/:id (DELETE)", () => {
    it("should delete a participant", async () => {
      const response = await request(app.getHttpServer())
        .delete("/participant/1")
        .set("Authorization", authToken)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: 1,
          name: "Adam",
          surname: "Nowak",
        }),
      );
    });
  });
});
