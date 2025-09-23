import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { ActivityService } from "./activity.service";

describe("ActivityService", () => {
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ActivityService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
