import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TaskStatus, TaskPriority, ActivityAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FractionalIndexService } from './fractional-index.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  organizationId: string;
  taskNumber: number;
  taskIdentifier: string; // e.g. "APP-101"
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  orderKey: string;
  version: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignees?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }>;
  subtaskCount?: {
    total: number;
    completed: number;
  };
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fractionalIndex: FractionalIndexService
  ) {}

  /**
   * Creates a new task with monotonic taskNumber, fractional orderKey,
   * validated project member assignees, and initial status history.
   */
  async create(
    orgId: string,
    projectId: string,
    actorId: string,
    dto: CreateTaskDto
  ): Promise<TaskResponse> {
    // 1. Fetch project to verify existence and get project key for identifier (e.g. "APP")
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
      select: { id: true, key: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. Validate that all assignees are valid project members (FR-041)
    if (dto.assigneeIds && dto.assigneeIds.length > 0) {
      const validProjectMembers = await this.prisma.projectMember.findMany({
        where: {
          projectId,
          userId: { in: dto.assigneeIds },
        },
        select: { userId: true },
      });

      if (validProjectMembers.length !== dto.assigneeIds.length) {
        throw new BadRequestException(
          'All task assignees must be active members of this project.'
        );
      }
    }

    const initialStatus = dto.status ?? TaskStatus.TODO;
    const initialPriority = dto.priority ?? TaskPriority.MEDIUM;

    // 3. Atomic creation transaction
    const createdTask = await this.prisma.$transaction(async (tx) => {
      // Monotonic taskNumber calculation within this project
      const lastTask = await tx.task.findFirst({
        where: { projectId },
        orderBy: { taskNumber: 'desc' },
        select: { taskNumber: true },
      });
      const nextTaskNumber = (lastTask?.taskNumber ?? 0) + 1;

      // Fractional orderKey calculation for column
      const lastInColumn = await tx.task.findFirst({
        where: { projectId, status: initialStatus, deletedAt: null },
        orderBy: { orderKey: 'desc' },
        select: { orderKey: true },
      });
      const orderKey = this.fractionalIndex.generateKeyBetween(
        lastInColumn?.orderKey ?? null,
        null
      );

      // Create Task
      const task = await tx.task.create({
        data: {
          organizationId: orgId,
          projectId,
          taskNumber: nextTaskNumber,
          title: dto.title,
          description: dto.description ?? null,
          status: initialStatus,
          priority: initialPriority,
          orderKey,
          version: 1,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          createdById: actorId,
        },
      });

      // Create Assignees
      if (dto.assigneeIds && dto.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: dto.assigneeIds.map((userId) => ({
            taskId: task.id,
            userId,
            assignedById: actorId,
          })),
        });
      }

      // Create Subtasks (Checklist Items - Q4)
      if (dto.subtasks && dto.subtasks.length > 0) {
        await tx.subtask.createMany({
          data: dto.subtasks.map((title, index) => ({
            taskId: task.id,
            title,
            position: index,
            createdById: actorId,
          })),
        });
      }

      // Create Initial Status History
      await tx.taskStatusHistory.create({
        data: {
          taskId: task.id,
          fromStatus: initialStatus,
          toStatus: initialStatus,
          changedById: actorId,
        },
      });

      // Record Activity Log
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'TASK',
          entityId: task.id,
          action: ActivityAction.TASK_CREATED,
          metadata: {
            taskIdentifier: `${project.key}-${task.taskNumber}`,
            title: task.title,
            status: task.status,
          },
        },
      });

      return task;
    });

    this.logger.log(`Task created: ${project.key}-${createdTask.taskNumber} (${createdTask.id})`);

    return this.mapToResponse(createdTask, project.key);
  }

  /**
   * Retrieves tasks for a project matching filter criteria, pre-sorted by orderKey and id.
   */
  async findAll(
    projectId: string,
    filters: TaskFilterOptions = {}
  ): Promise<TaskResponse[]> {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId, deletedAt: null },
      select: { key: true },
    });

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assigneeId && {
          assignees: {
            some: { userId: filters.assigneeId },
          },
        }),
        ...(filters.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        subtasks: {
          select: { isCompleted: true },
        },
      },
      // Uses the pre-sorted partial composite index (projectId, status, orderKey ASC, id ASC)
      orderBy: [{ orderKey: 'asc' }, { id: 'asc' }],
    });

    return tasks.map((t) => {
      const completedSubtasks = t.subtasks.filter((s) => s.isCompleted).length;
      return {
        ...this.mapToResponse(t, project.key),
        assignees: t.assignees.map((a) => a.user),
        subtaskCount: {
          total: t.subtasks.length,
          completed: completedSubtasks,
        },
      };
    });
  }

  /**
   * Retrieves single task details including assignees, subtasks, dependencies, and history.
   */
  async findById(projectId: string, taskId: string): Promise<Record<string, unknown>> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId, deletedAt: null },
      include: {
        project: { select: { key: true } },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                taskNumber: true,
                title: true,
                status: true,
              },
            },
          },
        },
        dependentOn: {
          include: {
            task: {
              select: {
                id: true,
                taskNumber: true,
                title: true,
                status: true,
              },
            },
          },
        },
        statusHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      ...this.mapToResponse(task, task.project.key),
      assignees: task.assignees.map((a) => a.user),
      subtasks: task.subtasks,
      prerequisites: task.dependencies.map((d) => ({
        ...d.dependsOnTask,
        taskIdentifier: `${task.project.key}-${d.dependsOnTask.taskNumber}`,
      })),
      dependents: task.dependentOn.map((d) => ({
        ...d.task,
        taskIdentifier: `${task.project.key}-${d.task.taskNumber}`,
      })),
      statusHistory: task.statusHistories,
    };
  }

  /**
   * Updates task details with Optimistic Concurrency Control (OCC).
   */
  async update(
    projectId: string,
    taskId: string,
    actorId: string,
    dto: UpdateTaskDto
  ): Promise<TaskResponse> {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { key: true, organizationId: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      // OCC update: Increment version only if current version matches expected
      const updateResult = await tx.task.updateMany({
        where: {
          id: taskId,
          projectId,
          version: dto.version,
          deletedAt: null,
        },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.dueDate !== undefined && {
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          }),
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        const current = await tx.task.findUnique({
          where: { id: taskId },
          select: { version: true },
        });

        if (!current) {
          throw new NotFoundException('Task not found');
        }

        throw new ConflictException(
          `Task was modified concurrently (current version: ${current.version}, expected: ${dto.version}). Please refresh and retry.`
        );
      }

      const updated = await tx.task.findUniqueOrThrow({ where: { id: taskId } });

      await tx.activityLog.create({
        data: {
          organizationId: project.organizationId,
          actorId,
          entityType: 'TASK',
          entityId: taskId,
          action: ActivityAction.TASK_UPDATED,
          metadata: { version: updated.version },
        },
      });

      return updated;
    });

    return this.mapToResponse(result, project.key);
  }

  /**
   * Moves a task to a new Kanban column / position with OCC,
   * records status transition history, and audit log (TX-01).
   */
  async moveTask(
    projectId: string,
    taskId: string,
    actorId: string,
    dto: MoveTaskDto
  ): Promise<TaskResponse> {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { key: true, organizationId: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Fetch current status to detect column transition
      const current = await tx.task.findFirst({
        where: { id: taskId, projectId, deletedAt: null },
        select: { id: true, status: true, version: true },
      });

      if (!current) {
        throw new NotFoundException('Task not found');
      }

      if (current.version !== dto.version) {
        throw new ConflictException(
          `Task was modified concurrently by another user (current version: ${current.version}, expected: ${dto.version}). Please refresh.`
        );
      }

      // 2. Atomic OCC update
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          status: dto.status,
          orderKey: dto.orderKey,
          version: { increment: 1 },
        },
      });

      // 3. Record status history if column changed
      if (current.status !== dto.status) {
        await tx.taskStatusHistory.create({
          data: {
            taskId,
            fromStatus: current.status,
            toStatus: dto.status,
            changedById: actorId,
          },
        });
      }

      // 4. Record Activity Log
      await tx.activityLog.create({
        data: {
          organizationId: project.organizationId,
          actorId,
          entityType: 'TASK',
          entityId: taskId,
          action: ActivityAction.TASK_MOVED,
          metadata: {
            fromStatus: current.status,
            toStatus: dto.status,
            orderKey: dto.orderKey,
            version: updated.version,
          },
        },
      });

      return updated;
    });

    return this.mapToResponse(result, project.key);
  }

  /**
   * Synchronizes task assignees, verifying that all users are project members.
   */
  async syncAssignees(
    projectId: string,
    taskId: string,
    actorId: string,
    userIds: string[]
  ): Promise<{ message: string }> {
    // 1. Verify task belongs to project
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 2. Verify all assignees are active project members (FR-041)
    if (userIds.length > 0) {
      const validMembers = await this.prisma.projectMember.findMany({
        where: {
          projectId,
          userId: { in: userIds },
        },
        select: { userId: true },
      });

      if (validMembers.length !== userIds.length) {
        throw new BadRequestException('All assignees must be members of this project.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete unassigned
      await tx.taskAssignee.deleteMany({
        where: {
          taskId,
          userId: { notIn: userIds },
        },
      });

      // Fetch existing
      const existing = await tx.taskAssignee.findMany({
        where: { taskId },
        select: { userId: true },
      });
      const existingIds = new Set(existing.map((e) => e.userId));

      const newIds = userIds.filter((id) => !existingIds.has(id));

      if (newIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: newIds.map((uid) => ({
            taskId,
            userId: uid,
            assignedById: actorId,
          })),
        });
      }

      await tx.activityLog.create({
        data: {
          organizationId: task.organizationId,
          actorId,
          entityType: 'TASK',
          entityId: taskId,
          action: ActivityAction.TASK_ASSIGNMENT_UPDATED,
          metadata: { assignees: userIds },
        },
      });
    });

    return { message: 'Task assignees updated successfully' };
  }

  /**
   * Soft-deletes a task.
   */
  async delete(projectId: string, taskId: string, actorId: string): Promise<{ message: string }> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId, deletedAt: null },
      select: { id: true, organizationId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          organizationId: task.organizationId,
          actorId,
          entityType: 'TASK',
          entityId: taskId,
          action: ActivityAction.TASK_DELETED,
        },
      });
    });

    return { message: 'Task deleted successfully' };
  }

  private mapToResponse(
    task: {
      id: string;
      projectId: string;
      organizationId: string;
      taskNumber: number;
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      orderKey: string;
      version: number;
      dueDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    projectKey: string
  ): TaskResponse {
    return {
      id: task.id,
      projectId: task.projectId,
      organizationId: task.organizationId,
      taskNumber: task.taskNumber,
      taskIdentifier: `${projectKey}-${task.taskNumber}`,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      orderKey: task.orderKey,
      version: task.version,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
