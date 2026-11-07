import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrgRole, ProjectRole, ActivityAction } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      project: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      projectMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      membership: {
        findUnique: jest.fn(),
      },
      task: {
        updateMany: jest.fn(),
      },
      taskAssignee: {
        deleteMany: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('create', () => {
    it('should create project and assign creator as PROJECT_MANAGER', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null);
      mockPrisma.project.create.mockResolvedValue({
        id: 'p1',
        name: 'Mobile App',
        key: 'APP',
        description: 'Test project',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.projectMember.create.mockResolvedValue({ id: 'pm1' });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'a1' });

      const result = await service.create('org1', 'u1', {
        name: 'Mobile App',
        key: 'APP',
        description: 'Test project',
      });

      expect(result.id).toBe('p1');
      expect(result.key).toBe('APP');
      expect(result.role).toBe(ProjectRole.PROJECT_MANAGER);
      expect(mockPrisma.projectMember.create).toHaveBeenCalledWith({
        data: {
          projectId: 'p1',
          userId: 'u1',
          role: ProjectRole.PROJECT_MANAGER,
        },
      });
    });

    it('should throw ConflictException if project key is already taken in the organization', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'existing-p' });

      await expect(
        service.create('org1', 'u1', {
          name: 'Mobile App',
          key: 'APP',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllForUser (Private by default - Q2)', () => {
    it('should return all projects if user is ORG_OWNER', async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: 'p1',
          name: 'P1',
          key: 'P1',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [{ role: ProjectRole.PROJECT_MANAGER }],
          _count: { members: 2, tasks: 5 },
        },
      ]);

      const result = await service.findAllForUser('org1', 'u1', OrgRole.ORG_OWNER);

      expect(result).toHaveLength(1);
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org1', deletedAt: null },
        })
      );
    });

    it('should filter only user memberships if user is ORG_MEMBER', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      await service.findAllForUser('org1', 'u2', OrgRole.ORG_MEMBER);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            members: { some: { userId: 'u2' } },
          }),
        })
      );
    });
  });

  describe('delete (TX-04 Cascading Soft-Delete)', () => {
    it('should soft-delete project and cascade soft-delete to tasks', async () => {
      mockPrisma.project.update.mockResolvedValue({ id: 'p1' });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 12 });

      const result = await service.delete('org1', 'p1', 'u1');

      expect(result.message).toContain('deleted successfully');
      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1', organizationId: 'org1', deletedAt: null },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'p1', deletedAt: null },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });
  });

  describe('member management & invariants', () => {
    it('should add member if user is part of the organization', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({ id: 'org_mem' });
      mockPrisma.projectMember.findUnique.mockResolvedValue(null);
      mockPrisma.projectMember.create.mockResolvedValue({
        id: 'pm1',
        userId: 'u2',
        role: ProjectRole.PROJECT_MEMBER,
        createdAt: new Date(),
        user: { id: 'u2', email: 'u2@test.com', firstName: 'B', lastName: 'C', avatarUrl: null },
      });

      const result = await service.addMember('org1', 'p1', 'u1', {
        userId: 'u2',
        role: ProjectRole.PROJECT_MEMBER,
      });

      expect(result.userId).toBe('u2');
      expect(result.role).toBe(ProjectRole.PROJECT_MEMBER);
    });

    it('should throw BadRequestException if target user is not in organization', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null); // Not in organization

      await expect(
        service.addMember('org1', 'p1', 'u1', { userId: 'stranger-id' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent demoting sole project manager', async () => {
      mockPrisma.projectMember.findUnique.mockResolvedValue({
        id: 'pm1',
        projectId: 'p1',
        userId: 'u1',
        role: ProjectRole.PROJECT_MANAGER,
        user: { id: 'u1' },
      });
      mockPrisma.projectMember.count.mockResolvedValue(1); // Sole manager

      await expect(
        service.updateMemberRole('p1', 'u1', 'u1', ProjectRole.PROJECT_MEMBER)
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent removing sole project manager', async () => {
      mockPrisma.projectMember.findUnique.mockResolvedValue({
        id: 'pm1',
        projectId: 'p1',
        userId: 'u1',
        role: ProjectRole.PROJECT_MANAGER,
      });
      mockPrisma.projectMember.count.mockResolvedValue(1); // Sole manager

      await expect(service.removeMember('p1', 'u1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});
