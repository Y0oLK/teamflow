import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrgRole } from '@prisma/client';
import { TenantGuard } from './tenant.guard';
import { PrismaService } from '../../modules/prisma/prisma.service';

describe('TenantGuard (Multi-Tenant Isolation Engine)', () => {
  let guard: TenantGuard;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      organization: {
        findFirst: jest.fn(),
      },
    };
    guard = new TenantGuard(mockPrisma as unknown as PrismaService);
  });

  const createMockContext = (
    user: any,
    params: Record<string, string> = {},
    headers: Record<string, string> = {}
  ): ExecutionContext => {
    const request = {
      user,
      params,
      headers,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access when user is a verified member of the organization', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    const context = createMockContext(user, { orgId: 'org-1' });

    mockPrisma.organization.findFirst.mockResolvedValue({
      id: 'org-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      memberships: [{ role: OrgRole.ORG_MEMBER }],
    });

    const canActivate = await guard.canActivate(context);
    const request = context.switchToHttp().getRequest() as any;

    expect(canActivate).toBe(true);
    expect(request.tenant).toEqual({
      id: 'org-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      role: OrgRole.ORG_MEMBER,
    });
    expect(request.user.currentOrgId).toBe('org-1');
  });

  it('CRITICAL SECURITY: should throw ForbiddenException on cross-tenant access attempt (user not in org)', async () => {
    const user = { id: 'attacker-user', email: 'attacker@evil.com' };
    const context = createMockContext(user, { orgId: 'victim-org-123' });

    // Organization exists, but user has NO membership
    mockPrisma.organization.findFirst.mockResolvedValue({
      id: 'victim-org-123',
      name: 'Victim Corp',
      slug: 'victim-corp',
      memberships: [], // Empty memberships for attacker
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if organization does not exist', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    const context = createMockContext(user, { orgId: 'non-existent-org' });

    mockPrisma.organization.findFirst.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if organization identifier is missing', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    const context = createMockContext(user, {}, {}); // No params or headers

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});

