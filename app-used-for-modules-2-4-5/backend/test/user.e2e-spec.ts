import request from "supertest";
import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

interface UserResponse {
  email: string;
  username: string | null;
  role: string;
  note: string | null;
  lastlogin: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  password?: string;
}

function generateTestToken(email: string): string {
  const issuedAt = Date.now();
  return `token_${email}_${issuedAt.toString()}`;
}

describe("UserController (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;
  let adminAuthToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    await seedDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    );
    await app.init();

    authToken = `Bearer ${generateTestToken("adam.nowak@imejl.pl")}`;
    adminAuthToken = `Bearer ${generateTestToken("admin@example.com")}`;
  }, 10_000);

  afterEach(async () => {
    await app.close();
  });

  describe("/users (GET)", () => {
    it("should return all non-archived users", async () => {
      const response = await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", authToken)
        .expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as UserResponse[]).length).toBeGreaterThan(0);
      for (const user of response.body as UserResponse[]) {
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("role");
        expect(user).not.toHaveProperty("password");
        expect(user.isArchived).toBe(false);
      }
    });

    it("should require authentication", async () => {
      await request(app.getHttpServer()).get("/users").expect(401);
    });
  });

  describe("/users/:email (GET)", () => {
    it("should return a user by email", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          email: "adam.nowak@imejl.pl",
          username: expect.any(String) as string,
          role: expect.any(String) as string,
        }),
      );
      expect(response.body).toHaveProperty("password");
    });

    it("should return a non-existent user", async () => {
      await request(app.getHttpServer())
        .get("/users/nieistnieje@imejl.pl")
        .set("Authorization", authToken)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app.getHttpServer())
        .get("/users/adam.nowak@imejl.pl")
        .expect(401);
    });
  });

  describe("/users/:email (PATCH)", () => {
    it("should allow user to update their own profile", async () => {
      const updateData = {
        username: "zaktualizowany_adam",
        note: "Zaktualizowana notatka",
      };
      const response = await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          email: "adam.nowak@imejl.pl",
          username: "zaktualizowany_adam",
          note: "Zaktualizowana notatka",
        }),
      );
      expect(response.body).not.toHaveProperty("password");
    });

    it("should allow admin to update any user", async () => {
      const updateData = {
        username: "zaktualizował_admin",
        note: "Zaktualizowane przez admina",
      };
      const response = await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", adminAuthToken)
        .send(updateData)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          email: "adam.nowak@imejl.pl",
          username: "zaktualizował_admin",
          note: "Zaktualizowane przez admina",
        }),
      );
    });

    it("should validate NicePassword constraint", async () => {
      const updateData = {
        password: "słabe",
      };
      await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(400);
    });
    it("should validate NiceText constraint", async () => {
      const updateData = {
        note: "przegryw",
      };
      await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(400);
    });

    it("should validate email format if provided", async () => {
      const updateData = {
        email: "niepoprawny-email",
      };
      await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(400);
    });

    it("should validate username length", async () => {
      const updateData = {
        username: "x".repeat(101),
      };
      await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(400);
    });

    it("should return a non-existent user", async () => {
      const updateData = {
        username: "zaktualizowany",
      };
      await request(app.getHttpServer())
        .patch("/users/nieistnieje@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(404);
    });

    it("should require authentication", async () => {
      const updateData = {
        username: "nieautoryzowana_aktualizacja",
      };
      await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .send(updateData)
        .expect(401);
    });

    it("should handle password update", async () => {
      const updateData = {
        password: "NoweHasło123!",
      };
      const response = await request(app.getHttpServer())
        .patch("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .send(updateData)
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          email: "adam.nowak@imejl.pl",
        }),
      );
      expect(response.body).not.toHaveProperty("password");
    });
  });

  describe("/users/:email (DELETE)", () => {
    it("should delete a user", async () => {
      await request(app.getHttpServer())
        .delete("/users/adam.nowak@imejl.pl")
        .set("Authorization", adminAuthToken)
        .expect(200);
      await request(app.getHttpServer())
        .get("/users/adam.nowak@imejl.pl")
        .set("Authorization", adminAuthToken)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app.getHttpServer())
        .delete("/users/adam.nowak@imejl.pl")
        .expect(401);
    });

    it("should require ADMIN role", async () => {
      await request(app.getHttpServer())
        .delete("/users/adam.nowak@imejl.pl")
        .set("Authorization", authToken)
        .expect(403);
    });

    it("should return a non-existent user", async () => {
      await request(app.getHttpServer())
        .delete("/users/nieistnieje@imejl.pl")
        .set("Authorization", adminAuthToken)
        .expect(404);
    });
  });
});
