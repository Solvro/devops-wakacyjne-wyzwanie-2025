import { Role } from "@prisma/client";

import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import type { UserMetadata } from "../../user/dto/user-metadata.dto";
import { RoleGuard } from "./role.guard";

const createMockExecutionContext = (
  user: Partial<UserMetadata> | null = null,
): ExecutionContext => {
  const mockRequest = { user };
  const mockHttp = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttp),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
};

describe("RoleGuard", () => {
  let guard: RoleGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow access when no roles are required", () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockExecutionContext();
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it("should allow access when user has required role", () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.USER]);
    const context = createMockExecutionContext({
      role: Role.ADMIN,
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it("should throw ForbiddenException when user has no roles", () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = createMockExecutionContext({
      role: Role.USER,
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException when user role does not match required roles", () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = createMockExecutionContext({
      role: Role.USER,
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
