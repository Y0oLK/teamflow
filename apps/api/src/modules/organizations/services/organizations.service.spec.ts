import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrgRole, ActivityAction } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      organization: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      membership: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('create', () => {
    it('should create organization with creator as ORG_OWNER', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.organization.create.mockResolvedValue({
        id: 'org1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.membership.create.mockResolvedValue({ id: 'm1' });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'a1' });

      const result = await service.create('user1', {
        name: 'Acme Corp',
        slug: 'acme-corp',
      });

      expect(result.id).toBe('org1');
      expect(result.role).toBe(OrgRole.ORG_OWNER);
      expect(mockPrisma.membership.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org1',
          userId: 'user1',
          role: OrgRole.ORG_OWNER,
        },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: ActivityAction.ORG_CREATED,
          }),
        })
      );
    });

    it('should throw ConflictException if slug is already taken', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'existing-org' });

      await expect(
        service.create('user1', {
          name: 'Acme Corp',
          slug: 'acme-corp',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllForUser', () => {
    it('should return all organizations user belongs to', async () => {
      mockPrisma.membership.findMany.mockResolvedValue([
        {
          role: OrgRole.ORG_OWNER,
          organization: {
            id: 'org1',
            name: 'Acme Corp',
            slug: 'acme-corp',
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]);

      const result = await service.findAllForUser('user1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Acme Corp');
      expect(result[0].role).toBe(OrgRole.ORG_OWNER);
    });
  });
});

