import { ParticipantRole, ParticipantSex } from "@prisma/client";

import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { DatabaseService } from "../database/database.service";
import type { CreateParticipantDto } from "./dto/create-participant.dto";
import type { UpdateParticipantDto } from "./dto/update-participant.dto";
import { ParticipantService } from "./participant.service";

const mockDatabaseService = {
  participant: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("ParticipantService", () => {
  let service: ParticipantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a participant", async () => {
      const createParticipantDto: CreateParticipantDto = {
        name: "Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        email: "adam.nowak@imejl.pl",
        phone: "123456789",
        address: "ul. Warszawska 9, 99-999 Warszawa",
        iban: "16000000000000000000000000",
        isAdult: true,
        dateOfBirth: "1990-01-01",
        placeOfBirth: "Gdańsk",
        sex: ParticipantSex.MALE,
        note: "uczestnik",
        tripsIds: [1],
        expensesIds: [1],
      };
      const expectedParticipant = {
        id: 1,
        name: createParticipantDto.name,
        surname: createParticipantDto.surname,
        role: createParticipantDto.role,
        email: createParticipantDto.email,
        phone: createParticipantDto.phone,
        address: createParticipantDto.address,
        iban: createParticipantDto.iban,
        isAdult: createParticipantDto.isAdult,
        dateOfBirth: createParticipantDto.dateOfBirth,
        placeOfBirth: createParticipantDto.placeOfBirth,
        sex: createParticipantDto.sex,
        note: createParticipantDto.note,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.create.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.create(createParticipantDto);
      expect(mockDatabaseService.participant.create).toHaveBeenCalledWith({
        data: {
          name: "Adam",
          surname: "Nowak",
          role: ParticipantRole.PARTICIPANT,
          email: "adam.nowak@imejl.pl",
          phone: "123456789",
          address: "ul. Warszawska 9, 99-999 Warszawa",
          iban: "16000000000000000000000000",
          isAdult: true,
          dateOfBirth: "1990-01-01",
          placeOfBirth: "Gdańsk",
          sex: ParticipantSex.MALE,
          note: "uczestnik",
          trips: {
            connect: [{ id: 1 }],
          },
          expenses: {
            connect: [{ id: 1 }],
          },
        },
      });
      expect(result).toEqual(expectedParticipant);
    });

    it("should create a participant without trips and expenses", async () => {
      const createParticipantDto: CreateParticipantDto = {
        name: "Anna",
        surname: "Kowalska",
        role: ParticipantRole.PARTICIPANT,
        isAdult: true,
        sex: ParticipantSex.FEMALE,
      };
      const expectedParticipant = {
        id: 2,
        name: createParticipantDto.name,
        surname: createParticipantDto.surname,
        role: createParticipantDto.role,
        isAdult: createParticipantDto.isAdult,
        sex: createParticipantDto.sex,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.create.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.create(createParticipantDto);
      expect(mockDatabaseService.participant.create).toHaveBeenCalledWith({
        data: {
          name: "Anna",
          surname: "Kowalska",
          role: ParticipantRole.PARTICIPANT,
          isAdult: true,
          sex: ParticipantSex.FEMALE,
        },
      });
      expect(result).toEqual(expectedParticipant);
    });
  });

  describe("findAll", () => {
    it("should return an array of participants", async () => {
      const expectedParticipants = [
        {
          id: 1,
          name: "Adam",
          surname: "Nowak",
          role: ParticipantRole.PARTICIPANT,
          sex: ParticipantSex.MALE,
          isAdult: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
        {
          id: 2,
          name: "Joanna",
          surname: "Nowak",
          role: ParticipantRole.GUIDE,
          sex: ParticipantSex.FEMALE,
          isAdult: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        },
      ];
      mockDatabaseService.participant.findMany.mockResolvedValue(
        expectedParticipants,
      );
      const result = await service.findAll();
      expect(mockDatabaseService.participant.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
      });
      expect(result).toEqual(expectedParticipants);
    });
  });

  describe("findOne", () => {
    it("should return a participant by id", async () => {
      const expectedParticipant = {
        id: 1,
        name: "Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        sex: ParticipantSex.MALE,
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.findUnique.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.findOne(1);
      expect(mockDatabaseService.participant.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedParticipant);
    });

    it("should return null if participant not found", async () => {
      mockDatabaseService.participant.findUnique.mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(mockDatabaseService.participant.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a participant", async () => {
      const updateParticipantDto: UpdateParticipantDto = {
        name: "Zaktualizowany Adam",
        email: "adam.zaktualizowany@imejl.pl",
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      const expectedParticipant = {
        id: 1,
        name: "Zaktualizowany Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        email: "adam.zaktualizowany@imejl.pl",
        sex: ParticipantSex.MALE,
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.update.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.update(1, updateParticipantDto);
      expect(mockDatabaseService.participant.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "Zaktualizowany Adam",
          email: "adam.zaktualizowany@imejl.pl",
          updatedAt: updateParticipantDto.updatedAt,
          isArchived: false,
        },
      });
      expect(result).toEqual(expectedParticipant);
    });

    it("should update a participant with trips and expenses", async () => {
      const updateParticipantDto: UpdateParticipantDto = {
        name: "Zaktualizowany Adam",
        tripsIds: [1, 2],
        expensesIds: [3, 4],
      };
      const expectedParticipant = {
        id: 1,
        name: "Zaktualizowany Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        sex: ParticipantSex.MALE,
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.update.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.update(1, updateParticipantDto);
      expect(mockDatabaseService.participant.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "Zaktualizowany Adam",
          trips: {
            set: [{ id: 1 }, { id: 2 }],
          },
          expenses: {
            set: [{ id: 3 }, { id: 4 }],
          },
        },
      });
      expect(result).toEqual(expectedParticipant);
    });
  });

  describe("remove", () => {
    it("should delete a participant", async () => {
      const expectedParticipant = {
        id: 1,
        name: "Adam",
        surname: "Nowak",
        role: ParticipantRole.PARTICIPANT,
        sex: ParticipantSex.MALE,
        isAdult: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      };
      mockDatabaseService.participant.delete.mockResolvedValue(
        expectedParticipant,
      );
      const result = await service.remove(1);
      expect(mockDatabaseService.participant.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedParticipant);
    });
  });
});
