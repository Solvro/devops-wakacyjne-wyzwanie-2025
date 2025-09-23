import { ParticipantRole, ParticipantSex } from "@prisma/client";

import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { RoleGuard } from "../auth/roles/role.guard";
import type { CreateParticipantDto } from "./dto/create-participant.dto";
import type { UpdateParticipantDto } from "./dto/update-participant.dto";
import { ParticipantController } from "./participant.controller";
import { ParticipantService } from "./participant.service";

const mockParticipantService = {
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

describe("ParticipantController", () => {
  let controller: ParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: mockParticipantService,
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

    controller = module.get<ParticipantController>(ParticipantController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service create method", async () => {
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
      const mockResult = { id: 1, name: "Adam", surname: "Nowak" };
      mockParticipantService.create.mockResolvedValue(mockResult);
      const result = await controller.create(createParticipantDto);
      expect(mockParticipantService.create).toHaveBeenCalledWith(
        createParticipantDto,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("findAll", () => {
    it("should call service findAll method", async () => {
      const mockResult = [{ id: 1, name: "Adam", surname: "Nowak" }];
      mockParticipantService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll();
      expect(mockParticipantService.findAll).toHaveBeenCalledWith({
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
      const mockResult = { id: 1, name: "Adam", surname: "Nowak" };
      mockParticipantService.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne(1);
      expect(mockParticipantService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });

  describe("update", () => {
    it("should call service update method", async () => {
      const updateParticipantDto: UpdateParticipantDto = {
        name: "Zaktualizowany Adam",
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      const mockResult = { id: 1, name: "Zaktualizowany Adam" };
      mockParticipantService.update.mockResolvedValue(mockResult);
      const result = await controller.update(1, updateParticipantDto);
      expect(mockParticipantService.update).toHaveBeenCalledWith(
        1,
        updateParticipantDto,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("remove", () => {
    it("should call service remove method", async () => {
      const mockResult = { id: 1, name: "Adam", surname: "Nowak" };
      mockParticipantService.remove.mockResolvedValue(mockResult);
      const result = await controller.remove(1);
      expect(mockParticipantService.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });
});
