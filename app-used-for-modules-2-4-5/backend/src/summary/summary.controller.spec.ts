import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { SummaryController } from "./summary.controller";
import { SummaryService } from "./summary.service";

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

describe("SummaryController", () => {
  let controller: SummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        {
          provide: SummaryService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
