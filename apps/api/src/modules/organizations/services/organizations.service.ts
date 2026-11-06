import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { OrgRole, ActivityAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: OrgRole;
}

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new organization, generates unique slug, and assigns creator as ORG_OWNER.
   */
  async create(userId: string, dto: CreateOrganizationDto): Promise<OrganizationResponse> {
    const slug = dto.slug ? dto.slug.toLowerCase() : this.generateSlug(dto.name);

    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSlug) {
      throw new ConflictException(`Organization slug '${slug}' is already taken.`);
    }

    const org = await this.prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const createdOrg = await tx.organization.create({
        data: {
          name: dto.name,
          slug,
        },
      });

      // 2. Assign Creator as Sole Initial ORG_OWNER
      await tx.membership.create({
        data: {
          organizationId: createdOrg.id,
          userId,
          role: OrgRole.ORG_OWNER,
        },
      });

      // 3. Record Audit Trail
      await tx.activityLog.create({
        data: {
          organizationId: createdOrg.id,
          actorId: userId,
          entityType: 'ORGANIZATION',
          entityId: createdOrg.id,
          action: ActivityAction.ORG_CREATED,
          metadata: { name: createdOrg.name, slug: createdOrg.slug },
        },
      });

      return createdOrg;
    });

    this.logger.log(`Organization created: ${org.name} (${org.id}) by user: ${userId}`);

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      avatarUrl: org.avatarUrl,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      role: OrgRole.ORG_OWNER,
    };
  }

  /**
   * Returns all active organizations in which the user holds a valid membership.
   */
  async findAllForUser(userId: string): Promise<OrganizationResponse[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        organization: { deletedAt: null },
      },
      include: {
        organization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      avatarUrl: m.organization.avatarUrl,
      createdAt: m.organization.createdAt,
      updatedAt: m.organization.updatedAt,
      role: m.role,
    }));
  }

  /**
   * Retrieves an organization by ID with membership and project metrics.
   */
  async findById(orgId: string): Promise<Record<string, unknown>> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId, deletedAt: null },
      include: {
        _count: {
          select: {
            memberships: true,
            projects: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      avatarUrl: org.avatarUrl,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      metrics: {
        memberCount: org._count.memberships,
        projectCount: org._count.projects,
        taskCount: org._count.tasks,
      },
    };
  }

  /**
   * Updates organization settings (name, avatarUrl).
   */
  async update(orgId: string, actorId: string, dto: UpdateOrganizationDto): Promise<OrganizationResponse> {
    const org = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id: orgId, deletedAt: null },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        },
      });

      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'ORGANIZATION',
          entityId: orgId,
          action: ActivityAction.ORG_UPDATED,
          metadata: {
            changes: {
              ...(dto.name !== undefined && { name: dto.name }),
              ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
            },
          },
        },
      });

      return updated;
    });

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      avatarUrl: org.avatarUrl,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  /**
   * Soft-deletes an organization and records audit trail.
   */
  async delete(orgId: string, actorId: string): Promise<{ message: string }> {
    await this.prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: orgId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'ORGANIZATION',
          entityId: orgId,
          action: ActivityAction.ORG_UPDATED,
          metadata: { action: 'DELETED' },
        },
      });
    });

    this.logger.warn(`Organization ${orgId} soft-deleted by user ${actorId}`);
    return { message: 'Organization deleted successfully' };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  }
}
