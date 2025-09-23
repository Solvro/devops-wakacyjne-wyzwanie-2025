import { ExpenseCategory } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { CurrencyExpenseService } from "../currency/currency-expense.service";
import { DatabaseService } from "../database/database.service";
import type { CreateExpenseDto } from "./dto/create-expense.dto";
import type { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseService } from "./expense.service";

const mockDatabaseService = {
  expense: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCurrencyExpenseService: Partial<CurrencyExpenseService> = {
  getExchangeRateInfo: jest.fn(),
  convertExpenseAmountToPLN: jest.fn(),
};

describe("ExpenseService", () => {
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CurrencyExpenseService,
          useValue: mockCurrencyExpenseService,
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    (
      mockCurrencyExpenseService.getExchangeRateInfo as jest.Mock
    ).mockResolvedValue({
      rate: 4.5,
      lastUpdated: new Date(),
    });
    (
      mockCurrencyExpenseService.convertExpenseAmountToPLN as jest.Mock
    ).mockResolvedValue(5400);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an expense", async () => {
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
      mockDatabaseService.expense.create.mockResolvedValue({
        id: 1,
        title: createExpenseDto.title,
        category: createExpenseDto.category,
        recipientName: createExpenseDto.recipientName,
        recipientIban: createExpenseDto.recipientIban,
        quantity: createExpenseDto.quantity,
        currency: createExpenseDto.currency,
        amount: new Decimal(1200),
        budgetLeft: new Decimal(800),
        note: createExpenseDto.note,
        participantId: createExpenseDto.participantId,
        tripId: createExpenseDto.tripId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        activityId: null,
      });
      const result = await service.create(createExpenseDto);
      expect(mockDatabaseService.expense.create).toHaveBeenCalledWith({
        data: createExpenseDto,
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("title", createExpenseDto.title);
      expect(result).toHaveProperty("amount", 1200);
      expect(result).toHaveProperty("amountInPLN", null);
    });
  });

  describe("findAll", () => {
    it("should return an array of expenses", async () => {
      mockDatabaseService.expense.findMany.mockResolvedValue([
        {
          id: 1,
          title: "Spektakl w teatrze",
          category: ExpenseCategory.ENTERTAINMENT,
          currency: "PLN",
          amount: new Decimal(1200),
          budgetLeft: new Decimal(800),
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          recipientName: null,
          recipientIban: null,
          quantity: null,
          note: null,
          participantId: null,
          tripId: null,
          activityId: null,
        },
      ]);
      const result = await service.findAll();
      expect(mockDatabaseService.expense.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("id", 1);
      expect(result[0]).toHaveProperty("title", "Spektakl w teatrze");
      expect(result[0]).toHaveProperty("exchangeRate", 4.5);
    });
  });

  describe("findOne", () => {
    it("should return an expense by id", async () => {
      mockDatabaseService.expense.findUnique.mockResolvedValue({
        id: 1,
        title: "Spektakl w teatrze",
        category: ExpenseCategory.ENTERTAINMENT,
        currency: "PLN",
        amount: new Decimal(1200),
        budgetLeft: new Decimal(800),
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        recipientName: null,
        recipientIban: null,
        quantity: null,
        note: null,
        participantId: null,
        tripId: null,
        activityId: null,
      });
      const result = await service.findOne(1);
      expect(mockDatabaseService.expense.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("title", "Spektakl w teatrze");
      expect(result).toHaveProperty("exchangeRate", 4.5);
    });

    it("should throw NotFoundException if expense not found", async () => {
      mockDatabaseService.expense.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        "Expense with id 999 not found",
      );
      expect(mockDatabaseService.expense.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe("update", () => {
    it("should update an expense", async () => {
      const updateExpenseDto: UpdateExpenseDto = {
        title: "Zaktualizowany spektakl w teatrze",
        amount: new Decimal(1600),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      mockDatabaseService.expense.update.mockResolvedValue({
        id: 1,
        title: "Zaktualizowany spektakl w teatrze",
        category: ExpenseCategory.ENTERTAINMENT,
        currency: "PLN",
        amount: new Decimal(1600),
        budgetLeft: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        recipientName: null,
        recipientIban: null,
        quantity: null,
        note: null,
        participantId: null,
        tripId: null,
        activityId: null,
      });
      const result = await service.update(1, updateExpenseDto);
      expect(mockDatabaseService.expense.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateExpenseDto,
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty(
        "title",
        "Zaktualizowany spektakl w teatrze",
      );
      expect(result).toHaveProperty("exchangeRate", 4.5);
    });
  });

  describe("remove", () => {
    it("should delete an expense", async () => {
      mockDatabaseService.expense.delete.mockResolvedValue({
        id: 1,
        title: "Spektakl w teatrze",
        category: ExpenseCategory.ENTERTAINMENT,
        currency: "PLN",
        amount: new Decimal(1200),
        budgetLeft: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        recipientName: null,
        recipientIban: null,
        quantity: null,
        note: null,
        participantId: null,
        tripId: null,
        activityId: null,
      });
      const result = await service.remove(1);
      expect(mockDatabaseService.expense.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("title", "Spektakl w teatrze");
      expect(result).toHaveProperty("amount", 1200);
    });
  });
});
