import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrgRole, ActivityAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface MemberResponse {
  id: string;
  userId: string;
  role: OrgRole;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all active members of an organization.
   */
  async getMembers(orgId: string): Promise<MemberResponse[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        organizationId: orgId,
        user: { deletedAt: null },
      },
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
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    }));
  }

  /**
   * Updates a member's role while enforcing the Sole-Owner Invariant (BR-010)
   * with pessimistic row locking to prevent concurrent demotion race conditions.
   */
  async updateMemberRole(
    orgId: string,
    actorId: string,
    actorRole: OrgRole,
    targetMemberId: string,
    newRole: OrgRole
  ): Promise<MemberResponse> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Acquire pessimistic row lock on the organization row to serialize concurrent member modifications
      await tx.$queryRaw`SELECT id FROM organizations WHERE id = ${orgId}::uuid FOR UPDATE`;

      // 2. Fetch target member inside the locked transaction
      const target = await tx.membership.findUnique({
        where: { id: targetMemberId },
        include: { user: true },
      });

      if (!target || target.organizationId !== orgId) {
        throw new NotFoundException('Member not found in this organization');
      }

      if (target.role === newRole) {
        return {
          id: target.id,
          userId: target.userId,
          role: target.role,
          createdAt: target.createdAt,
          user: {
            id: target.user.id,
            email: target.user.email,
            firstName: target.user.firstName,
            lastName: target.user.lastName,
            avatarUrl: target.user.avatarUrl,
          },
        };
      }

      // Permission check: Only ORG_OWNER can promote to ORG_OWNER or demote an ORG_OWNER
      if (target.role === OrgRole.ORG_OWNER || newRole === OrgRole.ORG_OWNER) {
        if (actorRole !== OrgRole.ORG_OWNER) {
          throw new ForbiddenException('Only an organization owner can transfer or assign the ORG_OWNER role.');
        }
      }

      // Invariant Enforcement: If target is currently ORG_OWNER and being demoted, verify another owner exists
      if (target.role === OrgRole.ORG_OWNER && newRole !== OrgRole.ORG_OWNER) {
        const ownerCount = await tx.membership.count({
          where: { organizationId: orgId, role: OrgRole.ORG_OWNER },
        });

        if (ownerCount <= 1) {
          throw new BadRequestException(
            'Cannot demote the sole organization owner. Transfer ownership to another member first.'
          );
        }
      }

      // 3. Perform atomic update
      const updated = await tx.membership.update({
        where: { id: targetMemberId },
        data: { role: newRole },
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
      });

      // 4. Record audit trail
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'MEMBERSHIP',
          entityId: targetMemberId,
          action: ActivityAction.MEMBER_ROLE_CHANGED,
          metadata: {
            previousRole: target.role,
            newRole,
            targetUserId: target.userId,
          },
        },
      });

      this.logger.log(`Member ${targetMemberId} role changed from ${target.role} to ${newRole} by actor ${actorId}`);

      return {
        id: updated.id,
        userId: updated.userId,
        role: updated.role,
        createdAt: updated.createdAt,
        user: updated.user,
      };
    });
  }

  /**
   * Removes a member from the organization, enforcing the Sole-Owner Invariant (BR-010)
   * with pessimistic row locking to prevent concurrent removal race conditions.
   */
  async removeMember(
    orgId: string,
    actorId: string,
    actorRole: OrgRole,
    targetMemberId: string
  ): Promise<{ message: string }> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Acquire pessimistic row lock on the organization row to serialize concurrent member modifications
      await tx.$queryRaw`SELECT id FROM organizations WHERE id = ${orgId}::uuid FOR UPDATE`;

      const target = await tx.membership.findUnique({
        where: { id: targetMemberId },
      });

      if (!target || target.organizationId !== orgId) {
        throw new NotFoundException('Member not found in this organization');
      }

      // Only ORG_OWNER can remove another ORG_OWNER
      if (target.role === OrgRole.ORG_OWNER && actorRole !== OrgRole.ORG_OWNER) {
        throw new ForbiddenException('Only an organization owner can remove another owner.');
      }

      // Invariant: Cannot remove sole owner
      if (target.role === OrgRole.ORG_OWNER) {
        const ownerCount = await tx.membership.count({
          where: { organizationId: orgId, role: OrgRole.ORG_OWNER },
        });

        if (ownerCount <= 1) {
          throw new BadRequestException('Cannot remove the sole organization owner.');
        }
      }

      // 2. Delete organization membership
      await tx.membership.delete({
        where: { id: targetMemberId },
      });

      // 3. Cascade delete project memberships in this organization
      await tx.projectMember.deleteMany({
        where: {
          userId: target.userId,
          project: { organizationId: orgId },
        },
      });

      // 4. Record audit trail
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'MEMBERSHIP',
          entityId: targetMemberId,
          action: ActivityAction.MEMBER_REMOVED,
          metadata: { removedUserId: target.userId, role: target.role },
        },
      });

      this.logger.log(`Member ${targetMemberId} removed from organization ${orgId} by actor ${actorId}`);
      return { message: 'Member removed successfully' };
    });
  }
}

