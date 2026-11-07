import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard (RBAC Enforcement)', () => {
  let guard: RolesGuard;
  let mockReflector: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(mockReflector as unknown as Reflector);
  });

  const createMockContext = (tenant?: { role: OrgRole }): ExecutionContext => {
    const request = { tenant };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({ role: OrgRole.ORG_MEMBER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if tenant role matches one of the required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN]);
    const context = createMockContext({ role: OrgRole.ORG_ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('RBAC AUDIT: should reject request with 403 if tenant role is insufficient', () => {
    mockReflector.getAllAndOverride.mockReturnValue([OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN]);
    const context = createMockContext({ role: OrgRole.ORG_MEMBER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if tenant context is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue([OrgRole.ORG_OWNER]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
