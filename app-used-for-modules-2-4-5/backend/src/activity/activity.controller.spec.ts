import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";

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

describe("ActivityController", () => {
  let controller: ActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
