import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { AuthenticatedUser } from '../../modules/auth/interfaces/jwt-payload.interface';
import { TenantContext } from '../decorators/current-tenant.decorator';

interface RequestWithTenant extends Request {
  user?: AuthenticatedUser;
  tenant?: TenantContext;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const orgIdentifier = this.extractOrgIdentifier(request);

    if (!orgIdentifier) {
      throw new ForbiddenException('Organization context is required for this operation');
    }

    // Determine if identifier is UUID or Slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgIdentifier);

    const organization = await this.prisma.organization.findFirst({
      where: {
        ...(isUuid ? { id: orgIdentifier } : { slug: orgIdentifier.toLowerCase() }),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        memberships: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = organization.memberships[0];
    if (!membership) {
      // In accordance with AGENTS.md Section 8 Security Rules:
      // "Every organization-scoped operation must verify the authenticated user's access.
      // Never trust organization IDs supplied by the frontend."
      throw new ForbiddenException('You do not have access to this organization.');
    }

    // Attach verified tenant context
    request.tenant = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership.role,
    };
    user.currentOrgId = organization.id;

    return true;
  }

  private extractOrgIdentifier(request: Request): string | null {
    // 1. Path parameters
    const params = request.params as Record<string, string>;
    if (params.orgId) return params.orgId;
    if (params.organizationId) return params.organizationId;
    if (params.slug) return params.slug;

    // 2. Custom header
    const header = request.headers['x-organization-id'];
    if (header && typeof header === 'string') return header;

    return null;
  }
}
