import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { OrgRole, ProjectRole, ActivityAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';

export interface ProjectResponse {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: ProjectRole;
  metrics?: {
    memberCount: number;
    taskCount: number;
  };
}

export interface ProjectMemberResponse {
  id: string;
  userId: string;
  role: ProjectRole;
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
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new project in the organization and assigns creator as PROJECT_MANAGER.
   */
  async create(
    orgId: string,
    userId: string,
    dto: CreateProjectDto
  ): Promise<ProjectResponse> {
    const existing = await this.prisma.project.findFirst({
      where: {
        organizationId: orgId,
        key: dto.key,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Project key '${dto.key}' is already in use in this organization.`
      );
    }

    const project = await this.prisma.$transaction(async (tx) => {
      // 1. Create Project
      const created = await tx.project.create({
        data: {
          organizationId: orgId,
          name: dto.name,
          key: dto.key,
          description: dto.description ?? null,
          createdById: userId,
        },
      });

      // 2. Assign Creator as PROJECT_MANAGER
      await tx.projectMember.create({
        data: {
          projectId: created.id,
          userId,
          role: ProjectRole.PROJECT_MANAGER,
        },
      });

      // 3. Record Audit Trail
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId: userId,
          entityType: 'PROJECT',
          entityId: created.id,
          action: ActivityAction.PROJECT_CREATED,
          metadata: { name: created.name, key: created.key },
        },
      });

      return created;
    });

    this.logger.log(`Project created: ${project.key} (${project.id}) in org: ${orgId}`);

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role: ProjectRole.PROJECT_MANAGER,
    };
  }

  /**
   * Lists projects for authenticated user in the organization (Private by Default - Q2).
   */
  async findAllForUser(
    orgId: string,
    userId: string,
    orgRole: OrgRole
  ): Promise<ProjectResponse[]> {
    const isOrgAdmin =
      orgRole === OrgRole.ORG_OWNER || orgRole === OrgRole.ORG_ADMIN;

    const projects = await this.prisma.project.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...(!isOrgAdmin && {
          members: {
            some: { userId },
          },
        }),
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: {
            members: true,
            tasks: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      key: p.key,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      role: p.members[0]?.role ?? ProjectRole.PROJECT_MANAGER,
      metrics: {
        memberCount: p._count.members,
        taskCount: p._count.tasks,
      },
    }));
  }

  /**
   * Retrieves single project details and metrics.
   */
  async findById(orgId: string, projectId: string): Promise<Record<string, unknown>> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: orgId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            members: true,
            tasks: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      metrics: {
        memberCount: project._count.members,
        taskCount: project._count.tasks,
      },
    };
  }

  /**
   * Updates project settings (name, description).
   */
  async update(
    orgId: string,
    projectId: string,
    actorId: string,
    dto: UpdateProjectDto
  ): Promise<ProjectResponse> {
    const project = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: projectId, organizationId: orgId, deletedAt: null },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      });

      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'PROJECT',
          entityId: projectId,
          action: ActivityAction.PROJECT_UPDATED,
          metadata: {
            changes: {
              ...(dto.name !== undefined && { name: dto.name }),
              ...(dto.description !== undefined && { description: dto.description }),
            },
          },
        },
      });

      return updated;
    });

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Executes TX-04 cascading soft-delete of project and all active child tasks.
   */
  async delete(
    orgId: string,
    projectId: string,
    actorId: string
  ): Promise<{ message: string }> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // 1. Soft-delete Project
      await tx.project.update({
        where: { id: projectId, organizationId: orgId, deletedAt: null },
        data: { deletedAt: now },
      });

      // 2. Cascade soft-delete to all child tasks (TX-04)
      await tx.task.updateMany({
        where: { projectId, deletedAt: null },
        data: { deletedAt: now },
      });

      // 3. Record audit trail
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          actorId,
          entityType: 'PROJECT',
          entityId: projectId,
          action: ActivityAction.PROJECT_DELETED,
          metadata: { deletedAt: now.toISOString() },
        },
      });
    });

    this.logger.warn(`Project ${projectId} soft-deleted by actor ${actorId}`);
    return { message: 'Project and child tasks deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // Project Membership Management
  // --------------------------------------------------------------------------

  async getMembers(projectId: string): Promise<ProjectMemberResponse[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId, user: { deletedAt: null } },
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

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    }));
  }

  async addMember(
    orgId: string,
    projectId: string,
    actorId: string,
    dto: AddProjectMemberDto
  ): Promise<ProjectMemberResponse> {
    // 1. Verify user is member of organization
    const orgMembership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: dto.userId,
        },
      },
    });

    if (!orgMembership) {
      throw new BadRequestException('User is not a member of this organization.');
    }

    // 2. Check if already project member
    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project.');
    }

    const memberRole = dto.role ?? ProjectRole.PROJECT_MEMBER;

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: memberRole,
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
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      user: member.user,
    };
  }

  async updateMemberRole(
    projectId: string,
    actorId: string,
    targetUserId: string,
    newRole: ProjectRole
  ): Promise<ProjectMemberResponse> {
    const target = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
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
    });

    if (!target) {
      throw new NotFoundException('Member not found in this project.');
    }

    // Invariant: At least one PROJECT_MANAGER must remain
    if (
      target.role === ProjectRole.PROJECT_MANAGER &&
      newRole !== ProjectRole.PROJECT_MANAGER
    ) {
      const managerCount = await this.prisma.projectMember.count({
        where: { projectId, role: ProjectRole.PROJECT_MANAGER },
      });

      if (managerCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the sole project manager. Assign another manager first.'
        );
      }
    }

    const updated = await this.prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
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

    return {
      id: updated.id,
      userId: updated.userId,
      role: updated.role,
      createdAt: updated.createdAt,
      user: updated.user,
    };
  }

  async removeMember(
    projectId: string,
    actorId: string,
    targetUserId: string
  ): Promise<{ message: string }> {
    const target = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    if (!target) {
      throw new NotFoundException('Member not found in this project.');
    }

    if (target.role === ProjectRole.PROJECT_MANAGER) {
      const managerCount = await this.prisma.projectMember.count({
        where: { projectId, role: ProjectRole.PROJECT_MANAGER },
      });

      if (managerCount <= 1) {
        throw new BadRequestException('Cannot remove the sole project manager.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Remove project membership
      await tx.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId: targetUserId,
          },
        },
      });

      // 2. Unassign from tasks in this project
      await tx.taskAssignee.deleteMany({
        where: {
          userId: targetUserId,
          task: { projectId },
        },
      });
    });

    return { message: 'Member removed from project successfully' };
  }
}
