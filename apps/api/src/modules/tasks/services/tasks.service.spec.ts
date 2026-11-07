import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskStatus, TaskPriority, ActivityAction } from '@prisma/client';
import { TasksService } from './tasks.service';
import { FractionalIndexService } from './fractional-index.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let mockPrisma: any;
  let mockFractionalIndex: any;

  beforeEach(async () => {
    mockPrisma = {
      project: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      projectMember: {
        findMany: jest.fn(),
      },
      task: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      taskAssignee: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      subtask: {
        createMany: jest.fn(),
      },
      taskStatusHistory: {
        create: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    mockFractionalIndex = {
      generateKeyBetween: jest.fn().mockReturnValue('a0'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FractionalIndexService, useValue: mockFractionalIndex },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('create', () => {
    it('should create task with monotonic taskNumber and validate assignees', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', key: 'APP' });
      mockPrisma.projectMember.findMany.mockResolvedValue([{ userId: 'u1' }]); // u1 is a member
      mockPrisma.task.findFirst.mockResolvedValue(null); // No prior task -> taskNumber: 1
      mockPrisma.task.create.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        organizationId: 'org1',
        taskNumber: 1,
        title: 'Build Login',
        description: null,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        orderKey: 'a0',
        version: 1,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.taskAssignee.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.taskStatusHistory.create.mockResolvedValue({ id: 'tsh1' });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'a1' });

      const result = await service.create('org1', 'p1', 'creator1', {
        title: 'Build Login',
        assigneeIds: ['u1'],
      });

      expect(result.id).toBe('t1');
      expect(result.taskNumber).toBe(1);
      expect(result.taskIdentifier).toBe('APP-1');
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskNumber: 1,
            version: 1,
            orderKey: 'a0',
          }),
        })
      );
    });

    it('should throw BadRequestException if any assignee is not a project member (FR-041)', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', key: 'APP' });
      mockPrisma.projectMember.findMany.mockResolvedValue([]); // u-stranger is not a project member

      await expect(
        service.create('org1', 'p1', 'creator1', {
          title: 'Unauthorized Assignment',
          assigneeIds: ['u-stranger'],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update (OCC)', () => {
    it('should update task and increment version when version matches', async () => {
      mockPrisma.project.findUniqueOrThrow.mockResolvedValue({ key: 'APP', organizationId: 'org1' });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 1 }); // OCC update matches
      mockPrisma.task.findUniqueOrThrow.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        organizationId: 'org1',
        taskNumber: 1,
        title: 'Updated Title',
        description: null,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        orderKey: 'a0',
        version: 2,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'a1' });

      const result = await service.update('p1', 't1', 'actor1', {
        title: 'Updated Title',
        priority: TaskPriority.HIGH,
        version: 1,
      });

      expect(result.version).toBe(2);
      expect(result.priority).toBe(TaskPriority.HIGH);
    });

    it('should throw ConflictException on OCC version mismatch (concurrent update)', async () => {
      mockPrisma.project.findUniqueOrThrow.mockResolvedValue({ key: 'APP', organizationId: 'org1' });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 0 }); // OCC check failed
      mockPrisma.task.findUnique.mockResolvedValue({ version: 2 }); // Current DB version has moved forward

      await expect(
        service.update('p1', 't1', 'actor1', {
          title: 'Stale Update',
          version: 1, // User sent version 1, but DB is at 2
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('moveTask (TX-01 Kanban move)', () => {
    it('should update status, orderKey, and insert status history', async () => {
      mockPrisma.project.findUniqueOrThrow.mockResolvedValue({ key: 'APP', organizationId: 'org1' });
      mockPrisma.task.findFirst.mockResolvedValue({
        id: 't1',
        status: TaskStatus.TODO,
        version: 1,
      });
      mockPrisma.task.update.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        organizationId: 'org1',
        taskNumber: 1,
        title: 'Task 1',
        description: null,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        orderKey: 'a0V',
        version: 2,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.taskStatusHistory.create.mockResolvedValue({ id: 'h1' });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'a1' });

      const result = await service.moveTask('p1', 't1', 'actor1', {
        status: TaskStatus.IN_PROGRESS,
        orderKey: 'a0V',
        version: 1,
      });

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.orderKey).toBe('a0V');
      expect(mockPrisma.taskStatusHistory.create).toHaveBeenCalledWith({
        data: {
          taskId: 't1',
          fromStatus: TaskStatus.TODO,
          toStatus: TaskStatus.IN_PROGRESS,
          changedById: 'actor1',
        },
      });
    });

    it('should throw ConflictException if task version changed concurrently during move', async () => {
      mockPrisma.project.findUniqueOrThrow.mockResolvedValue({ key: 'APP', organizationId: 'org1' });
      mockPrisma.task.findFirst.mockResolvedValue({
        id: 't1',
        status: TaskStatus.TODO,
        version: 2, // Current version is 2
      });

      await expect(
        service.moveTask('p1', 't1', 'actor1', {
          status: TaskStatus.DONE,
          orderKey: 'a0Z',
          version: 1, // User attempted move with stale version 1
        })
      ).rejects.toThrow(ConflictException);
    });
  });
});
