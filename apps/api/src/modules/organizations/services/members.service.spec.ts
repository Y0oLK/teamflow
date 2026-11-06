import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrgRole, ActivityAction } from '@prisma/client';
import { MembersService } from './members.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MembersService', () => {
  let service: MembersService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      membership: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      projectMember: {
        deleteMany: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('updateMemberRole', () => {
    it('should throw BadRequestException when trying to demote the sole owner', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem1',
        organizationId: 'org1',
        userId: 'user1',
        role: OrgRole.ORG_OWNER,
        user: { id: 'user1' },
      });
      mockPrisma.membership.count.mockResolvedValue(1); // Only 1 owner exists

      await expect(
        service.updateMemberRole('org1', 'user1', OrgRole.ORG_OWNER, 'mem1', OrgRole.ORG_ADMIN)
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow demoting owner when another owner exists', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem1',
        organizationId: 'org1',
        userId: 'user1',
        role: OrgRole.ORG_OWNER,
        user: { id: 'user1', email: 'u1@test.com', firstName: 'A', lastName: 'B', avatarUrl: null },
      });
      mockPrisma.membership.count.mockResolvedValue(2); // 2 owners exist
      mockPrisma.membership.update.mockResolvedValue({
        id: 'mem1',
        userId: 'user1',
        role: OrgRole.ORG_ADMIN,
        createdAt: new Date(),
        user: { id: 'user1', email: 'u1@test.com', firstName: 'A', lastName: 'B', avatarUrl: null },
      });

      const result = await service.updateMemberRole(
        'org1',
        'user2',
        OrgRole.ORG_OWNER,
        'mem1',
        OrgRole.ORG_ADMIN
      );

      expect(result.role).toBe(OrgRole.ORG_ADMIN);
      expect(mockPrisma.membership.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mem1' },
          data: { role: OrgRole.ORG_ADMIN },
        })
      );
    });

    it('should throw ForbiddenException if a non-owner tries to assign ORG_OWNER role', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem2',
        organizationId: 'org1',
        userId: 'user2',
        role: OrgRole.ORG_MEMBER,
        user: { id: 'user2' },
      });

      await expect(
        service.updateMemberRole(
          'org1',
          'admin1',
          OrgRole.ORG_ADMIN, // Actor is ADMIN, not OWNER
          'mem2',
          OrgRole.ORG_OWNER // Attempting to promote to OWNER
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('should throw BadRequestException when trying to remove the sole owner', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem1',
        organizationId: 'org1',
        userId: 'user1',
        role: OrgRole.ORG_OWNER,
      });
      mockPrisma.membership.count.mockResolvedValue(1);

      await expect(
        service.removeMember('org1', 'user1', OrgRole.ORG_OWNER, 'mem1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should remove member and clean up project memberships', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem2',
        organizationId: 'org1',
        userId: 'user2',
        role: OrgRole.ORG_MEMBER,
      });

      const result = await service.removeMember('org1', 'owner1', OrgRole.ORG_OWNER, 'mem2');

      expect(result.message).toBe('Member removed successfully');
      expect(mockPrisma.membership.delete).toHaveBeenCalledWith({ where: { id: 'mem2' } });
      expect(mockPrisma.projectMember.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: ActivityAction.MEMBER_REMOVED,
          }),
        })
      );
    });
  });
});
