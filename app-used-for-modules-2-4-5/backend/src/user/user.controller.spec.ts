import { Role } from "@prisma/client";

import { Reflector } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { RoleGuard } from "../auth/roles/role.guard";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

const mockUserService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
  dearchive: jest.fn(),
  remove: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockRoleGuard = {
  canActivate: jest.fn(() => true),
};

describe("UserController", () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockRoleGuard)
      .compile();
    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should call service findAll method", async () => {
      const mockResult = [{ email: "test@example.com", username: "test" }];
      mockUserService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll();
      expect(mockUserService.findAll).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });
  });

  describe("findOne", () => {
    it("should call service findOne method", async () => {
      const mockResult = { email: "test@example.com", username: "test" };
      mockUserService.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne("test@example.com");
      expect(mockUserService.findOne).toHaveBeenCalledWith("test@example.com");
      expect(result).toBe(mockResult);
    });
  });

  describe("update", () => {
    it("should call service update method", async () => {
      const updateUserDto: UpdateUserDto = {
        username: "zaktualizowany_uzytkownik",
        note: "Zaktualizowana notatka",
        isArchived: false,
      };
      const request = {
        user: {
          email: "uzytkownik@imejl.pl",
          role: Role.USER,
        },
      };
      const mockResult = {
        email: "uzytkownik@imejl.pl",
        username: "zaktualizowany_uzytkownik",
      };
      mockUserService.update.mockResolvedValue(mockResult);
      const result = await controller.update(
        "uzytkownik@imejl.pl",
        updateUserDto,
        request,
      );
      expect(mockUserService.update).toHaveBeenCalledWith(
        "uzytkownik@imejl.pl",
        updateUserDto,
        request.user,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("remove", () => {
    it("should call service remove method", async () => {
      mockUserService.remove.mockResolvedValue(null);
      await controller.remove("uzytkownik@imejl.pl");
      expect(mockUserService.remove).toHaveBeenCalledWith(
        "uzytkownik@imejl.pl",
      );
    });
  });

  describe("archive", () => {
    it("should call service archive method", async () => {
      const mockResult = { email: "test@example.com", isArchived: true };
      mockUserService.archive.mockResolvedValue(mockResult);
      const result = await controller.archive("test@example.com");
      expect(mockUserService.archive).toHaveBeenCalledWith("test@example.com");
      expect(result).toBe(mockResult);
    });
  });

  describe("dearchive", () => {
    it("should call service dearchive method", async () => {
      const mockResult = { email: "test@example.com", isArchived: false };
      mockUserService.dearchive.mockResolvedValue(mockResult);
      const result = await controller.dearchive("test@example.com");
      expect(mockUserService.dearchive).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(result).toBe(mockResult);
    });
  });
});
