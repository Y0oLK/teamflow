import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TenantContext } from '../decorators/current-tenant.decorator';
import { Request } from 'express';

interface RequestWithTenant extends Request {
  tenant?: TenantContext;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const tenant = request.tenant;

    if (!tenant) {
      throw new ForbiddenException('Tenant context not established. TenantGuard must run before RolesGuard.');
    }

    const hasRole = requiredRoles.includes(tenant.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. This action requires one of the following roles: [${requiredRoles.join(', ')}]. Your current role is: ${tenant.role}.`
      );
    }

    return true;
  }
}

