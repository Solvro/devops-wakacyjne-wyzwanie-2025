import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { CurrencyController } from "./currency.controller";
import { CurrencyService } from "./currency.service";

jest.mock("../auth/auth.guard", () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock("../auth/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    validateToken: jest.fn().mockResolvedValue({ userId: 1 }),
  })),
}));

describe("CurrencyController", () => {
  let controller: CurrencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
