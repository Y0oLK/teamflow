import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { OrgRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: OrgRole[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
