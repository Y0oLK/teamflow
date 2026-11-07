import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { DependenciesService } from './dependencies.service';
import { CycleDetectionService } from './cycle-detection.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DependenciesService', () => {
  let service: DependenciesService;
  let mockPrisma: any;
  let mockCycleDetection: any;

  beforeEach(async () => {
    mockPrisma = {
      task: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      taskDependency: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      taskStatusHistory: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    mockCycleDetection = {
      wouldCreateCycle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DependenciesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CycleDetectionService, useValue: mockCycleDetection },
      ],
    }).compile();

    service = module.get<DependenciesService>(DependenciesService);
  });

  describe('addDependency', () => {
    it('should throw BadRequestException if a task depends on itself', async () => {
      await expect(service.addDependency('p1', 't1', 't1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if either task is not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce(null); // task 1 not found
      mockPrisma.task.findFirst.mockResolvedValueOnce({ id: 't2' });

      await expect(service.addDependency('p1', 't1', 't2')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ConflictException if adding dependency would create a circular dependency', async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce({ id: 't1', status: TaskStatus.TODO });
      mockPrisma.task.findFirst.mockResolvedValueOnce({ id: 't2', status: TaskStatus.DONE });
      mockPrisma.taskDependency.findUnique.mockResolvedValue(null);
      mockCycleDetection.wouldCreateCycle.mockResolvedValue(true); // Cycle detected!

      await expect(service.addDependency('p1', 't1', 't2')).rejects.toThrow(
        ConflictException
      );
    });

    it('should successfully add dependency and transition target task to BLOCKED if prerequisite is not DONE', async () => {
      mockPrisma.task.findFirst.mockResolvedValueOnce({
        id: 't1',
        status: TaskStatus.TODO,
        createdById: 'u1',
      });
      mockPrisma.task.findFirst.mockResolvedValueOnce({
        id: 't2',
        status: TaskStatus.IN_PROGRESS, // Prerequisite not DONE
      });
      mockPrisma.taskDependency.findUnique.mockResolvedValue(null);
      mockCycleDetection.wouldCreateCycle.mockResolvedValue(false);
      mockPrisma.taskDependency.create.mockResolvedValue({
        id: 'dep1',
        taskId: 't1',
        dependsOnTaskId: 't2',
        createdAt: new Date(),
      });
      mockPrisma.task.update.mockResolvedValue({ id: 't1', status: TaskStatus.BLOCKED });
      mockPrisma.taskStatusHistory.create.mockResolvedValue({ id: 'h1' });

      const result = await service.addDependency('p1', 't1', 't2');

      expect(result.id).toBe('dep1');
      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: expect.objectContaining({ status: TaskStatus.BLOCKED }),
        })
      );
    });
  });

  describe('removeDependency', () => {
    it('should successfully remove an existing dependency', async () => {
      mockPrisma.taskDependency.findUnique.mockResolvedValue({
        taskId: 't1',
        dependsOnTaskId: 't2',
        task: { projectId: 'p1' },
      });
      mockPrisma.taskDependency.delete.mockResolvedValue({});

      const result = await service.removeDependency('p1', 't1', 't2');

      expect(result.message).toContain('removed successfully');
      expect(mockPrisma.taskDependency.delete).toHaveBeenCalledWith({
        where: {
          taskId_dependsOnTaskId: {
            taskId: 't1',
            dependsOnTaskId: 't2',
          },
        },
      });
    });
  });
});
