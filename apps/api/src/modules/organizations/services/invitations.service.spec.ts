import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrgRole, InvitationStatus, ActivityAction } from '@prisma/client';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../../auth/services/token.service';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let mockPrisma: any;
  let mockTokenService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockPrisma = {
      membership: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      invitation: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrisma)),
    };

    mockTokenService = {
      generateRandomToken: jest.fn().mockReturnValue('raw_invitation_token_123'),
      hashToken: jest.fn().mockReturnValue('hashed_invitation_token_123'),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  describe('invite', () => {
    it('should create an invitation for a new email', async () => {
      mockPrisma.membership.findFirst.mockResolvedValue(null);
      mockPrisma.invitation.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.invitation.create.mockResolvedValue({
        id: 'inv1',
        organizationId: 'org1',
        email: 'newuser@example.com',
        role: OrgRole.ORG_MEMBER,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.invite('org1', 'actor1', OrgRole.ORG_OWNER, {
        email: 'newuser@example.com',
        role: OrgRole.ORG_MEMBER,
      });

      expect(result.id).toBe('inv1');
      expect(result.email).toBe('newuser@example.com');
      expect(result.token).toBe('raw_invitation_token_123');
      expect(mockPrisma.invitation.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrisma.membership.findFirst.mockResolvedValue({ id: 'existing_mem' });

      await expect(
        service.invite('org1', 'actor1', OrgRole.ORG_OWNER, {
          email: 'member@example.com',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if non-owner tries to invite an admin', async () => {
      await expect(
        service.invite(
          'org1',
          'admin1',
          OrgRole.ORG_ADMIN, // Actor is ADMIN
          {
            email: 'admin2@example.com',
            role: OrgRole.ORG_ADMIN, // Attempting to invite ADMIN
          }
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('acceptInvitation', () => {
    it('should successfully accept invitation and create membership', async () => {
      mockPrisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1',
        organizationId: 'org1',
        email: 'user@example.com',
        role: OrgRole.ORG_MEMBER,
        organization: { name: 'Acme Corp' },
      });
      mockPrisma.membership.findUnique.mockResolvedValue(null);
      mockPrisma.invitation.updateMany.mockResolvedValue({ count: 1 }); // Atomic consume succeeds
      mockPrisma.membership.create.mockResolvedValue({ id: 'new_mem' });

      const result = await service.acceptInvitation('u1', 'user@example.com', {
        token: 'raw_invitation_token_123',
      });

      expect(result.message).toContain('Welcome to Acme Corp');
      expect(mockPrisma.invitation.updateMany).toHaveBeenCalledWith({
        where: { id: 'inv1', status: InvitationStatus.PENDING },
        data: expect.objectContaining({ status: InvitationStatus.ACCEPTED }),
      });
      expect(mockPrisma.membership.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org1',
          userId: 'u1',
          role: OrgRole.ORG_MEMBER,
        },
      });
    });

    it('should throw ForbiddenException if user email does not match invitation email', async () => {
      mockPrisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1',
        organizationId: 'org1',
        email: 'target@example.com',
        role: OrgRole.ORG_MEMBER,
      });

      await expect(
        service.acceptInvitation('attacker-id', 'attacker@example.com', {
          token: 'raw_invitation_token_123',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    it('CONCURRENCY AUDIT: should throw ConflictException if invitation was concurrently accepted by another process', async () => {
      mockPrisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1',
        organizationId: 'org1',
        email: 'user@example.com',
        role: OrgRole.ORG_MEMBER,
        organization: { name: 'Acme Corp' },
      });
      mockPrisma.membership.findUnique.mockResolvedValue(null);
      // Simulate race condition: updateMany returns count 0 because another concurrent request already updated it to ACCEPTED
      mockPrisma.invitation.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.acceptInvitation('u1', 'user@example.com', {
          token: 'raw_invitation_token_123',
        })
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.membership.create).not.toHaveBeenCalled();
    });
  });
});

