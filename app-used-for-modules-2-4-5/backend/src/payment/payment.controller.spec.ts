import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

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

describe("PaymentController", () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
