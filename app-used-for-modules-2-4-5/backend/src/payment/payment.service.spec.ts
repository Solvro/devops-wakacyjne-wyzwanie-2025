import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { PaymentService } from "./payment.service";

describe("PaymentService", () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
