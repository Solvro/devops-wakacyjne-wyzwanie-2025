import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { DatabaseService } from "../database/database.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

jest.mock("bcrypt");
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockDatabaseService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createUserDto: CreateUserDto = {
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        password: "Haslo123!",
        note: "Testowy uzytkownik",
      };
      const zhashowaneHaslo = "zhashowaneHaslo123";
      mockBcrypt.hash.mockResolvedValue(zhashowaneHaslo as never);
      const expectedUser = {
        id: 1,
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        password: zhashowaneHaslo,
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.user.create.mockResolvedValue(expectedUser);
      const result = await service.create(createUserDto);
      expect(mockBcrypt.hash).toHaveBeenCalledWith("Haslo123!", 10);
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: {
          email: "uzytkownik@imejl.pl",
          username: "testowy_uzytkownik",
          password: zhashowaneHaslo,
          role: Role.USER,
          note: "Testowy uzytkownik",
        },
      });
      expect(result).toEqual({
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: expectedUser.createdAt,
        updatedAt: expectedUser.updatedAt,
        isArchived: false,
      });
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const expectedUsers = [
        {
          id: 1,
          email: "uzytkownik1@imejl.pl",
          username: "uzytkownik1",
          password: "zhashowaneHaslo",
          role: Role.USER,
          note: "Pierwszy uzytkownik",
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
        {
          id: 2,
          email: "uzytkownik2@imejl.pl",
          username: "uzytkownik2",
          password: "zhashowaneHaslo",
          role: Role.ADMIN,
          note: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
      ];
      mockDatabaseService.user.findMany.mockResolvedValue(expectedUsers);
      const result = await service.findAll();
      expect(mockDatabaseService.user.findMany).toHaveBeenCalledWith({
        where: { isArchived: false },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        email: "uzytkownik1@imejl.pl",
        username: "uzytkownik1",
        role: Role.USER,
        note: "Pierwszy uzytkownik",
        createdAt: expectedUsers[0].createdAt,
        updatedAt: expectedUsers[0].updatedAt,
        isArchived: false,
      });
    });
  });

  describe("findOne", () => {
    it("should return a user by email", async () => {
      const expectedUser = {
        id: 1,
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        password: "zhashowaneHaslo",
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(expectedUser);
      const result = await service.findOne("uzytkownik@imejl.pl");
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "uzytkownik@imejl.pl" },
      });
      expect(result).toEqual(expectedUser);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne("nieistnieje@imejl.pl")).rejects.toThrow(
        new NotFoundException("User nieistnieje@imejl.pl not found"),
      );
    });
  });

  describe("findOneMetadata", () => {
    it("should return user metadata by email", async () => {
      const expectedUser = {
        id: 1,
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        password: "zhashowaneHaslo",
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(expectedUser);
      const result = await service.findOneMetadata("uzytkownik@imejl.pl");
      expect(result).toEqual({
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: expectedUser.createdAt,
        updatedAt: expectedUser.updatedAt,
        isArchived: false,
      });
    });

    it("should throw NotFoundException when user not found", async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.findOneMetadata("nieistnieje@imejl.pl"),
      ).rejects.toThrow(
        new NotFoundException("User nieistnieje@imejl.pl not found"),
      );
    });
  });

  describe("update", () => {
    const existingUser = {
      id: 1,
      email: "uzytkownik@imejl.pl",
      username: "testowy_uzytkownik",
      password: "stareZhashowanaHaslo",
      role: Role.USER,
      note: "Testowy uzytkownik",
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
    };

    it("should allow user to update their own profile", async () => {
      const updateUserDto: UpdateUserDto = {
        username: "zaktualizowany_uzytkownik",
        note: "Zaktualizowana notatka",
      };
      const currentUser = { email: "uzytkownik@imejl.pl", role: Role.USER };
      const zaktualizowany_uzytkownik = {
        id: existingUser.id,
        email: existingUser.email,
        username: updateUserDto.username ?? existingUser.username,
        password: existingUser.password,
        role: existingUser.role,
        note: updateUserDto.note ?? existingUser.note,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
        isArchived: existingUser.isArchived,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
      mockDatabaseService.user.update.mockResolvedValue(
        zaktualizowany_uzytkownik,
      );
      const result = await service.update(
        "uzytkownik@imejl.pl",
        updateUserDto,
        currentUser,
      );
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { email: "uzytkownik@imejl.pl" },
        data: updateUserDto,
      });
      expect(result.username).toBe("zaktualizowany_uzytkownik");
    });

    it("should allow admin to update any user", async () => {
      const updateUserDto: UpdateUserDto = {
        username: "zaktualizowany_admin",
      };
      const currentUser = { email: "admin@imejl.pl", role: Role.ADMIN };
      const zaktualizowany_uzytkownik = {
        id: existingUser.id,
        email: existingUser.email,
        username: updateUserDto.username ?? existingUser.username,
        password: existingUser.password,
        role: existingUser.role,
        note: existingUser.note,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
        isArchived: existingUser.isArchived,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
      mockDatabaseService.user.update.mockResolvedValue(
        zaktualizowany_uzytkownik,
      );
      const result = await service.update(
        "uzytkownik@imejl.pl",
        updateUserDto,
        currentUser,
      );
      expect(result.username).toBe("zaktualizowany_admin");
    });

    it("should hash password", async () => {
      const updateUserDto: UpdateUserDto = {
        password: "noweHaslo123!",
      };
      const currentUser = { email: "uzytkownik@imejl.pl", role: Role.USER };
      const zhashowaneHaslo = "noweZhashowaneHaslo";
      mockBcrypt.hash.mockResolvedValue(zhashowaneHaslo as never);
      mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
      mockDatabaseService.user.update.mockResolvedValue({
        ...existingUser,
        password: zhashowaneHaslo,
      });
      await service.update("uzytkownik@imejl.pl", updateUserDto, currentUser);
      expect(mockBcrypt.hash).toHaveBeenCalledWith("noweHaslo123!", 10);
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { email: "uzytkownik@imejl.pl" },
        data: { password: zhashowaneHaslo },
      });
    });

    it("should throw NotFoundException when user to update does not exist", async () => {
      const updateUserDto: UpdateUserDto = {
        username: "updated",
      };
      const currentUser = {
        email: "nieistnieje@imejl.pl",
        role: Role.USER,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.update("nieistnieje@imejl.pl", updateUserDto, currentUser),
      ).rejects.toThrow(
        new NotFoundException("User nieistnieje@imejl.pl not found"),
      );
    });
  });

  describe("remove", () => {
    it("should delete a user", async () => {
      const existingUser = {
        id: 1,
        email: "uzytkownik@imejl.pl",
        username: "testowy_uzytkownik",
        password: "zhashowaneHaslo",
        role: Role.USER,
        note: "Testowy uzytkownik",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.user.findUnique.mockResolvedValue(existingUser);
      mockDatabaseService.user.delete.mockResolvedValue(existingUser);
      await service.remove("uzytkownik@imejl.pl");
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
        where: { email: "uzytkownik@imejl.pl" },
      });
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(service.remove("nieistnieje@imejl.pl")).rejects.toThrow(
        new NotFoundException("User nieistnieje@imejl.pl not found"),
      );
    });
  });
});
