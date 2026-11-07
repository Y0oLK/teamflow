import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectMemberGuard } from '../../common/guards/project-member.guard';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectMemberGuard],
  exports: [ProjectsService, ProjectMemberGuard],
})
export class ProjectsModule {}
