import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrgRole, InvitationStatus, ActivityAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../../auth/services/token.service';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

export interface InvitationResponse {
  id: string;
  email: string;
  role: OrgRole;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token?: string; // Included only in dev/test mode
}

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);
  private readonly invitationDurationDays = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Invites a user by email to join the organization.
   */
  async invite(
    orgId: string,
    actorId: string,
    actorRole: OrgRole,
    dto: InviteMemberDto
  ): Promise<InvitationResponse> {
    const targetRole = dto.role ?? OrgRole.ORG_MEMBER;

    // Permissions check: Only ORG_OWNER can invite someone as ORG_OWNER or ORG_ADMIN
    if (targetRole === OrgRole.ORG_OWNER || targetRole === OrgRole.ORG_ADMIN) {
      if (actorRole !== OrgRole.ORG_OWNER) {
        throw new ForbiddenException('Only organization owners can invite new admins or owners.');
      }
    }

    // Check if user is already an active member
    const existingMember = await this.prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        user: { email: dto.email, deletedAt: null },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization.');
    }

    const rawToken = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.invitationDurationDays);

    const invitation = await this.prisma.$transaction(async (tx) => {
      // Invalidate any prior pending invitation for this email
      await tx.invitation.updateMany({
        where: {
          organizationId: orgId,
          email: dto.email,
          status: InvitationStatus.PENDING,
        },
        data: { status: InvitationStatus.REVOKED },
      });

      // Create new invitation
      const created = await tx.invitation.create({
        data: {
          organizationId: orgId,
          invitedById: actorId,
          email: dto.email,
          role: targetRole,
          tokenHash,
          status: InvitationStatus.PENDING,
          expiresAt,
        },
      });

      // Record audit
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'INVITATION',
          entityId: created.id,
          action: ActivityAction.MEMBER_INVITED,
          metadata: { invitedEmail: dto.email, role: targetRole },
        },
      });

      return created;
    });

    this.logger.log(`Invitation created for ${dto.email} to org ${orgId} by actor ${actorId}`);

    const response: InvitationResponse = {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    };

    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      response.token = rawToken;
    }

    return response;
  }

  /**
   * Lists pending invitations for an organization.
   */
  async getInvitations(orgId: string): Promise<InvitationResponse[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        organizationId: orgId,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      invitedBy: inv.invitedBy,
    }));
  }

  /**
   * Accepts an invitation, adds user to membership, and updates invitation status (TX-03).
   */
  async acceptInvitation(
    userId: string,
    userEmail: string,
    dto: AcceptInvitationDto
  ): Promise<{ message: string; organizationId: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);

    const invitation = await this.prisma.invitation.findFirst({
      where: {
        tokenHash,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: { organization: true },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation is invalid or has expired.');
    }

    // Email matching security check
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException(
        `This invitation was sent to '${invitation.email}'. You are currently logged in as '${userEmail}'.`
      );
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId,
        },
      },
    });

    if (existingMembership) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      });
      return {
        message: 'You are already a member of this organization.',
        organizationId: invitation.organizationId,
      };
    }

    // Atomic transaction for invitation acceptance (TX-03)
    await this.prisma.$transaction(async (tx) => {
      // 1. Atomically consume the invitation only if still PENDING (prevents concurrent double-acceptance)
      const updateResult = await tx.invitation.updateMany({
        where: {
          id: invitation.id,
          status: InvitationStatus.PENDING,
        },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException('Invitation has already been accepted or is no longer valid.');
      }

      // 2. Create Membership
      await tx.membership.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role,
        },
      });

      // 3. Record Audit Trail
      await tx.activityLog.create({
        data: {
          organizationId: invitation.organizationId,
          actorId: userId,
          entityType: 'ORGANIZATION',
          entityId: invitation.organizationId,
          action: ActivityAction.MEMBER_JOINED,
          metadata: { role: invitation.role, invitationId: invitation.id },
        },
      });
    });

    this.logger.log(`User ${userId} accepted invitation to organization ${invitation.organizationId}`);

    return {
      message: `Welcome to ${invitation.organization.name}!`,
      organizationId: invitation.organizationId,
    };
  }

  /**
   * Revokes an active invitation.
   */
  async revokeInvitation(orgId: string, actorId: string, invitationId: string): Promise<{ message: string }> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.organizationId !== orgId) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REVOKED },
    });

    return { message: 'Invitation revoked successfully' };
  }
}

