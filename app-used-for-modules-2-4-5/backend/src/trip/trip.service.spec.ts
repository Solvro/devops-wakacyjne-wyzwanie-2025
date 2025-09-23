import { TripCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { DatabaseService } from "../database/database.service";
import type { CreateTripDto } from "./dto/create-trip.dto";
import type { UpdateTripDto } from "./dto/update-trip.dto";
import { TripService } from "./trip.service";

const mockDatabaseService = {
  trip: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("TripService", () => {
  let service: TripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a trip", async () => {
      const createTripDto: CreateTripDto = {
        title: "Wakacje letnie",
        category: TripCategory.LEISURE,
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
      const expectedTrip = {
        id: 1,
        title: createTripDto.title,
        category: createTripDto.category,
        destination: createTripDto.destination,
        budget: createTripDto.budget,
        startDate: createTripDto.startDate,
        endDate: createTripDto.endDate,
        accommodation: createTripDto.accommodation,
        travelTime: createTripDto.travelTime,
        travelDistance: createTripDto.travelDistance,
        note: createTripDto.note,
        participantsIds: createTripDto.participantsIds,
        expensesIds: createTripDto.expensesIds,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.trip.create.mockResolvedValue(expectedTrip);
      const result = await service.create(createTripDto);
      const expectedCreateData = {
        title: "Wakacje letnie",
        category: TripCategory.LEISURE,
        destination: "Szczecin",
        budget: 2000,
        startDate: "2025-07-01",
        endDate: "2025-07-07",
        accommodation: "Ośrodek nad morzem",
        travelTime: new Decimal(2.5),
        travelDistance: new Decimal(500),
        note: "Wycieczka całą rodziną",
        participants: {
          connect: [{ id: 1 }, { id: 2 }],
        },
        expenses: {
          connect: [{ id: 1 }],
        },
      };
      expect(mockDatabaseService.trip.create).toHaveBeenCalledWith({
        data: expectedCreateData,
      });
      expect(result).toEqual(expectedTrip);
    });
  });

  describe("findAll", () => {
    it("should return an array of trips", async () => {
      const expectedTrips = [
        {
          id: 1,
          title: "Wakacje letnie",
          category: TripCategory.LEISURE,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
        {
          id: 2,
          title: "Wycieczka biznesowa",
          category: TripCategory.BUSINESS,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
      ];
      mockDatabaseService.trip.findMany.mockResolvedValue(expectedTrips);
      const result = await service.findAll();
      expect(mockDatabaseService.trip.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
      });
      expect(result).toEqual(expectedTrips);
    });
  });

  describe("findOne", () => {
    it("should return a trip by id", async () => {
      const expectedTrip = {
        id: 1,
        title: "Wakacje letnie",
        category: TripCategory.LEISURE,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.trip.findUnique.mockResolvedValue(expectedTrip);
      const result = await service.findOne(1);
      expect(mockDatabaseService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedTrip);
    });
    it("should throw NotFoundException if trip not found", async () => {
      mockDatabaseService.trip.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe("update", () => {
    it("should update a trip", async () => {
      const updateTripDto: UpdateTripDto = {
        title: "Zaktualizowane wakacje letnie",
        destination: "Ośrodek w górach",
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      const existingTrip = {
        id: 1,
        title: "Wakacje letnie",
        category: TripCategory.LEISURE,
        destination: "Plaża",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      const expectedTrip = {
        id: 1,
        title: "Zaktualizowane wakacje letnie",
        category: TripCategory.LEISURE,
        destination: "Ośrodek w górach",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.trip.findUnique.mockResolvedValue(existingTrip);
      mockDatabaseService.trip.update.mockResolvedValue(expectedTrip);
      const result = await service.update(1, updateTripDto);
      expect(mockDatabaseService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockDatabaseService.trip.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateTripDto,
      });
      expect(result).toEqual(expectedTrip);
    });
  });

  describe("remove", () => {
    it("should delete a trip", async () => {
      const expectedTrip = {
        id: 1,
        title: "Wakacje letnie",
        category: TripCategory.LEISURE,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.trip.findUnique.mockResolvedValue(expectedTrip);
      mockDatabaseService.trip.delete.mockResolvedValue(expectedTrip);
      const result = await service.remove(1);
      expect(mockDatabaseService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockDatabaseService.trip.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedTrip);
      expect(mockDatabaseService.trip.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedTrip);
    });
  });
});
