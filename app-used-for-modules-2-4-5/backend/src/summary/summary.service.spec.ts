import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { SummaryService } from "./summary.service";

describe("SummaryService", () => {
  let service: SummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SummaryService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
