import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';

export const PROJECT_ROLES_KEY = 'project_roles';
export const ProjectRoles = (...roles: ProjectRole[]): CustomDecorator<string> =>
  SetMetadata(PROJECT_ROLES_KEY, roles);
