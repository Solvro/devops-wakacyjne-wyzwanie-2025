import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { CurrencyService } from "./currency.service";

describe("CurrencyService", () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CurrencyService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
