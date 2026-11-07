import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SubtasksService (Single-Level Checklist Items - Q4)', () => {
  let service: SubtasksService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      task: {
        findUnique: jest.fn(),
      },
      subtask: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
  });

  describe('create', () => {
    it('should create subtask with auto-incremented position', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.subtask.findFirst.mockResolvedValue({ position: 2 });
      mockPrisma.subtask.create.mockResolvedValue({
        id: 'st1',
        taskId: 't1',
        title: 'Run test suite',
        isCompleted: false,
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create('t1', 'u1', { title: 'Run test suite' });

      expect(result.id).toBe('st1');
      expect(result.position).toBe(3);
      expect(mockPrisma.subtask.create).toHaveBeenCalledWith({
        data: {
          taskId: 't1',
          title: 'Run test suite',
          position: 3,
          createdById: 'u1',
        },
      });
    });

    it('should throw NotFoundException if parent task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.create('non-existent', 'u1', { title: 'Item' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should toggle isCompleted on checklist item', async () => {
      mockPrisma.subtask.findUnique.mockResolvedValue({ id: 'st1', isCompleted: false });
      mockPrisma.subtask.update.mockResolvedValue({
        id: 'st1',
        taskId: 't1',
        title: 'Run test suite',
        isCompleted: true,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('st1', { isCompleted: true });

      expect(result.isCompleted).toBe(true);
      expect(mockPrisma.subtask.update).toHaveBeenCalledWith({
        where: { id: 'st1' },
        data: { isCompleted: true },
      });
    });
  });

  describe('delete', () => {
    it('should delete checklist item', async () => {
      mockPrisma.subtask.findUnique.mockResolvedValue({ id: 'st1' });
      mockPrisma.subtask.delete.mockResolvedValue({});

      const result = await service.delete('st1');

      expect(result.message).toContain('deleted successfully');
      expect(mockPrisma.subtask.delete).toHaveBeenCalledWith({ where: { id: 'st1' } });
    });
  });
});
