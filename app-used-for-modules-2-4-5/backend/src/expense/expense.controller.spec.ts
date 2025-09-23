import { ExpenseCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import type { CreateExpenseDto } from "./dto/create-expense.dto";
import type { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseController } from "./expense.controller";
import { ExpenseService } from "./expense.service";

const mockExpenseService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe("ExpenseController", () => {
  let controller: ExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ExpenseController>(ExpenseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service create method", async () => {
      const createExpenseDto: CreateExpenseDto = {
        title: "Spektakl w teatrze",
        category: ExpenseCategory.ENTERTAINMENT,
        recipientName: "Teatr Polski, Wrocław",
        recipientIban: "161234567891234678913456",
        quantity: 7,
        currency: "PLN",
        amount: new Decimal(1200),
        budgetLeft: new Decimal(800),
        note: "Najlepiej oceniany spektakl",
        participantId: 1,
        tripId: 1,
      };
      const mockResult = { id: 1, title: "Spektakl w teatrze" };
      mockExpenseService.create.mockResolvedValue(mockResult);
      const result = await controller.create(createExpenseDto);
      expect(mockExpenseService.create).toHaveBeenCalledWith(createExpenseDto);
      expect(result).toBe(mockResult);
    });
  });

  describe("findAll", () => {
    it("should call service findAll method", async () => {
      const mockResult = [{ id: 1, title: "Spektakl w teatrze" }];
      mockExpenseService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll();
      expect(mockExpenseService.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: undefined,
      });
      expect(result).toBe(mockResult);
    });
  });

  describe("findOne", () => {
    it("should call service findOne method", async () => {
      const mockResult = { id: 1, title: "Spektakl w teatrze" };
      mockExpenseService.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne(1);
      expect(mockExpenseService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });

  describe("update", () => {
    it("should call service update method", async () => {
      const updateExpenseDto: UpdateExpenseDto = {
        title: "Zaktualizowany Spektakl w teatrze",
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      const mockResult = { id: 1, title: "Zaktualizowany Spektakl w teatrze" };
      mockExpenseService.update.mockResolvedValue(mockResult);
      const result = await controller.update(1, updateExpenseDto);
      expect(mockExpenseService.update).toHaveBeenCalledWith(
        1,
        updateExpenseDto,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("remove", () => {
    it("should call service remove method", async () => {
      const mockResult = { id: 1, title: "Spektakl w teatrze" };
      mockExpenseService.remove.mockResolvedValue(mockResult);
      const result = await controller.remove(1);
      expect(mockExpenseService.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });
});
