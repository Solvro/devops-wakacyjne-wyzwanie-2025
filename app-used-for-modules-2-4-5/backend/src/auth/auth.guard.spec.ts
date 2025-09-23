import { Role } from "@prisma/client";

import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import type { RequestWithUser } from "./dto/request-with-user.dto";

const createMockExecutionContext = (
  headers: Record<string, string> = {},
): ExecutionContext => {
  const mockRequest: RequestWithUser = { headers } as RequestWithUser;
  const mockHttp = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttp),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
};

describe("AuthGuard", () => {
  let guard: AuthGuard;

  const mockAuthService = {
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should throw UnauthorizedException when no authorization header", async () => {
    const context = createMockExecutionContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when token is invalid", async () => {
    mockAuthService.validateToken.mockRejectedValue(new Error("Invalid token"));
    const context = createMockExecutionContext({
      authorization: "Bearer invalid-token",
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should allow access when token is valid", async () => {
    const mockUser = {
      email: "test@imejl.pl",
      username: "testowy_uzytkownik",
      role: Role.USER,
      note: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      isArchived: false,
    };
    mockAuthService.validateToken.mockResolvedValue(mockUser);
    const context = createMockExecutionContext({
      authorization: "Bearer valid-token",
    });
    const result = await guard.canActivate(context);
    const request: RequestWithUser = context.switchToHttp().getRequest();
    expect(result).toBe(true);
    expect(request.user).toEqual(mockUser);
    expect(mockAuthService.validateToken).toHaveBeenCalledWith("valid-token");
  });
});
