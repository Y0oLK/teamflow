import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OrgRole } from '@prisma/client';

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
}

export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ tenant?: TenantContext }>();
    const tenant = request.tenant;

    if (!tenant) {
      return null;
    }

    return data ? tenant[data] : tenant;
  }
);

