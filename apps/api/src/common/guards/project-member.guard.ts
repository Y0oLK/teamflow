import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole, ProjectRole } from '@prisma/client';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { AuthenticatedUser } from '../../modules/auth/interfaces/jwt-payload.interface';
import { TenantContext } from '../decorators/current-tenant.decorator';
import { ProjectContext } from '../decorators/current-project.decorator';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';
import { Request } from 'express';

interface RequestWithProject extends Request {
  user?: AuthenticatedUser;
  tenant?: TenantContext;
  project?: ProjectContext;
}

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithProject>();
    const user = request.user;
    const tenant = request.tenant;

    if (!user || !tenant) {
      throw new ForbiddenException('Authentication and Organization context are required.');
    }

    const projectId = (request.params as Record<string, string>).projectId;
    if (!projectId) {
      throw new ForbiddenException('Project ID is required.');
    }

    // 1. Fetch project strictly scoped to organization and not soft-deleted
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: tenant.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        key: true,
        members: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found in this organization.');
    }

    // 2. Determine effective project role:
    // ORG_OWNER and ORG_ADMIN retain organization-wide administrative access (Q2)
    const isOrgAdmin =
      tenant.role === OrgRole.ORG_OWNER || tenant.role === OrgRole.ORG_ADMIN;

    const directMembership = project.members[0];

    if (!directMembership && !isOrgAdmin) {
      // Private by default (Q2) - Non-members cannot access
      throw new ForbiddenException('You are not a member of this project.');
    }

    const effectiveRole = directMembership?.role ?? ProjectRole.PROJECT_MANAGER;

    // 3. Verify @ProjectRoles() if specified
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(effectiveRole);
      if (!hasRole && !isOrgAdmin) {
        throw new ForbiddenException(
          `Insufficient project permissions. Requires one of: [${requiredRoles.join(', ')}].`
        );
      }
    }

    // 4. Attach project context
    request.project = {
      id: project.id,
      name: project.name,
      key: project.key,
      role: effectiveRole,
    };

    return true;
  }
}
