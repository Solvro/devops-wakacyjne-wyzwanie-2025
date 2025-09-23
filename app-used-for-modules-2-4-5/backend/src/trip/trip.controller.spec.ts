import { TripCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { RoleGuard } from "../auth/roles/role.guard";
import type { CreateTripDto } from "./dto/create-trip.dto";
import type { UpdateTripDto } from "./dto/update-trip.dto";
import { TripController } from "./trip.controller";
import { TripService } from "./trip.service";

const mockTripService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockRoleGuard = {
  canActivate: jest.fn(() => true),
};

describe("TripController", () => {
  let controller: TripController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [
        {
          provide: TripService,
          useValue: mockTripService,
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

    controller = module.get<TripController>(TripController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service create method", async () => {
      const createTripDto: CreateTripDto = {
        title: "Wakacje letnie",
        category: TripCategory.BUSINESS,
        destination: "Szczecin",
        budget: 2000,
        startDate: "2025-07-01",
        endDate: "2025-07-07",
        accommodation: "Ośrodek nad morzem",
        travelTime: new Decimal(2.5),
        travelDistance: new Decimal(500),
        note: "Wycieczka całą rodziną",
        participantsIds: [1, 2],
        expensesIds: [1],
      };
      const mockResult = { id: 1, title: "Wakacje letnie" };
      mockTripService.create.mockResolvedValue(mockResult);
      const result = await controller.create(createTripDto);
      expect(mockTripService.create).toHaveBeenCalledWith(createTripDto);
      expect(result).toBe(mockResult);
    });
  });

  describe("findAll", () => {
    it("should call service findAll method", async () => {
      const mockResult = [{ id: 1, title: "Wakacje letnie" }];
      mockTripService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll();
      expect(mockTripService.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: undefined,
        include: undefined,
      });
      expect(result).toBe(mockResult);
    });
  });

  describe("findOne", () => {
    it("should call service findOne method", async () => {
      const mockResult = { id: 1, title: "Wakacje letnie" };
      mockTripService.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne(1);
      expect(mockTripService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });

  describe("update", () => {
    it("should call service update method", async () => {
      const updateTripDto: UpdateTripDto = {
        title: "Zaktualizowane wakacje letnie",
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      const mockResult = { id: 1, title: "Zaktualizowane wakacje letnie" };
      mockTripService.update.mockResolvedValue(mockResult);
      const result = await controller.update(1, updateTripDto);
      expect(mockTripService.update).toHaveBeenCalledWith(1, updateTripDto);
      expect(result).toBe(mockResult);
    });
  });

  describe("remove", () => {
    it("should call service remove method", async () => {
      const mockResult = { id: 1, title: "Wakacje letnie" };
      mockTripService.remove.mockResolvedValue(mockResult);
      const result = await controller.remove(1);
      expect(mockTripService.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });
});
