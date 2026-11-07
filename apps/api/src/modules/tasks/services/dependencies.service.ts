import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CycleDetectionService } from './cycle-detection.service';

export interface DependencyResponse {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: Date;
}

@Injectable()
export class DependenciesService {
  private readonly logger = new Logger(DependenciesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cycleDetection: CycleDetectionService
  ) {}

  /**
   * Adds a task prerequisite dependency with cycle detection.
   * Semantic: taskId depends on dependsOnTaskId (dependsOnTaskId must finish first).
   */
  async addDependency(
    projectId: string,
    taskId: string,
    dependsOnTaskId: string
  ): Promise<DependencyResponse> {
    // 1. Invariant: A task cannot depend on itself
    if (taskId === dependsOnTaskId) {
      throw new BadRequestException('A task cannot depend on itself.');
    }

    // 2. Verify both tasks exist in the same project and are not deleted
    const [targetTask, prerequisiteTask] = await Promise.all([
      this.prisma.task.findFirst({
        where: { id: taskId, projectId, deletedAt: null },
      }),
      this.prisma.task.findFirst({
        where: { id: dependsOnTaskId, projectId, deletedAt: null },
      }),
    ]);

    if (!targetTask || !prerequisiteTask) {
      throw new NotFoundException(
        'One or both tasks do not exist in this project.'
      );
    }

    // 3. Check if dependency already exists
    const existing = await this.prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('This dependency relationship already exists.');
    }

    // 4. DAG Cycle Detection Algorithm
    const createsCycle = await this.cycleDetection.wouldCreateCycle(
      projectId,
      taskId,
      dependsOnTaskId
    );

    if (createsCycle) {
      throw new ConflictException(
        'Dependency cycle detected: adding this dependency would create a circular dependency loop.'
      );
    }

    // 5. Create dependency inside transaction
    const dependency = await this.prisma.$transaction(async (tx) => {
      const dep = await tx.taskDependency.create({
        data: {
          taskId,
          dependsOnTaskId,
        },
      });

      // FR-046: If prerequisite task is not completed, auto-transition target task to BLOCKED if currently in TODO or BACKLOG
      if (
        prerequisiteTask.status !== TaskStatus.DONE &&
        (targetTask.status === TaskStatus.TODO || targetTask.status === TaskStatus.BACKLOG)
      ) {
        await tx.task.update({
          where: { id: taskId },
          data: { status: TaskStatus.BLOCKED, version: { increment: 1 } },
        });

        await tx.taskStatusHistory.create({
          data: {
            taskId,
            fromStatus: targetTask.status,
            toStatus: TaskStatus.BLOCKED,
            changedById: targetTask.createdById,
          },
        });
      }

      return dep;
    });

    this.logger.log(`Dependency added: Task ${taskId} -> depends on ${dependsOnTaskId}`);

    return dependency;
  }

  /**
   * Removes a dependency.
   */
  async removeDependency(
    projectId: string,
    taskId: string,
    dependsOnTaskId: string
  ): Promise<{ message: string }> {
    const dependency = await this.prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId,
        },
      },
      include: {
        task: { select: { projectId: true } },
      },
    });

    if (!dependency || dependency.task.projectId !== projectId) {
      throw new NotFoundException('Dependency relationship not found in this project.');
    }

    await this.prisma.taskDependency.delete({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId,
        },
      },
    });

    return { message: 'Dependency removed successfully' };
  }
}
