import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { EmailProcessor } from "./email-processor";
import { EmailService } from "./email.service";

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

describe("EmailProcessor", () => {
  let processor: EmailProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: EmailService,
          useValue: {
            sendTripSummaryEmail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });
});
