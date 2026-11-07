import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';

export interface ProjectContext {
  id: string;
  name: string;
  key: string;
  role: ProjectRole;
}

export const CurrentProject = createParamDecorator(
  (data: keyof ProjectContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ project?: ProjectContext }>();
    const project = request.project;

    if (!project) {
      return null;
    }

    return data ? project[data] : project;
  }
);
