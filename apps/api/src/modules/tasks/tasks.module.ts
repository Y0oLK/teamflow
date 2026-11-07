import { Module } from '@nestjs/common';
import { TasksController } from './controllers/tasks.controller';
import { SubtasksController } from './controllers/subtasks.controller';
import { DependenciesController } from './controllers/dependencies.controller';
import { TasksService } from './services/tasks.service';
import { SubtasksService } from './services/subtasks.service';
import { DependenciesService } from './services/dependencies.service';
import { CycleDetectionService } from './services/cycle-detection.service';
import { FractionalIndexService } from './services/fractional-index.service';
import { ProjectMemberGuard } from '../../common/guards/project-member.guard';

@Module({
  controllers: [TasksController, SubtasksController, DependenciesController],
  providers: [
    TasksService,
    SubtasksService,
    DependenciesService,
    CycleDetectionService,
    FractionalIndexService,
    ProjectMemberGuard,
  ],
  exports: [
    TasksService,
    SubtasksService,
    DependenciesService,
    CycleDetectionService,
    FractionalIndexService,
  ],
})
export class TasksModule {}
