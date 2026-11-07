import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { OrgRole, ProjectRole } from '@prisma/client';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ProjectMemberGuard } from '../../../common/guards/project-member.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ProjectRoles } from '../../../common/decorators/project-roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentTenant, TenantContext } from '../../../common/decorators/current-tenant.decorator';
import { CurrentProject, ProjectContext } from '../../../common/decorators/current-project.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import {
  ProjectsService,
  ProjectResponse,
  ProjectMemberResponse,
} from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from '../dto/update-project-member-role.dto';

@ApiTags('Projects')
@Controller('organizations/:orgId/projects')
@UseGuards(TenantGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN, OrgRole.ORG_MEMBER)
  @ApiOperation({ summary: 'Create a new project (Creator assigned PROJECT_MANAGER)' })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 409, description: 'Project key already in use' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto
  ): Promise<ProjectResponse> {
    return this.projectsService.create(tenant.id, user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List projects for current user in organization (Private by default - Q2)',
  })
  @ApiResponse({ status: 200, description: 'List of accessible projects' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ProjectResponse[]> {
    return this.projectsService.findAllForUser(tenant.id, user.id, tenant.role);
  }

  @Get(':projectId')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'Get project details and task counts' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 403, description: 'Not a member of this project' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('projectId') projectId: string
  ): Promise<Record<string, unknown>> {
    return this.projectsService.findById(tenant.id, projectId);
  }

  @Patch(':projectId')
  @UseGuards(ProjectMemberGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update project settings (Project Manager only)' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto
  ): Promise<ProjectResponse> {
    return this.projectsService.update(tenant.id, projectId, user.id, dto);
  }

  @Delete(':projectId')
  @UseGuards(ProjectMemberGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete project and cascade to tasks (TX-04)' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  async delete(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string
  ): Promise<{ message: string }> {
    return this.projectsService.delete(tenant.id, projectId, user.id);
  }

  // --------------------------------------------------------------------------
  // Project Membership Endpoints
  // --------------------------------------------------------------------------

  @Get(':projectId/members')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'List members of the project' })
  @ApiResponse({ status: 200, description: 'Project member list' })
  async getMembers(
    @Param('projectId') projectId: string
  ): Promise<ProjectMemberResponse[]> {
    return this.projectsService.getMembers(projectId);
  }

  @Post(':projectId/members')
  @UseGuards(ProjectMemberGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Add an organization member to the project' })
  @ApiResponse({ status: 201, description: 'Member added to project' })
  async addMember(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto
  ): Promise<ProjectMemberResponse> {
    return this.projectsService.addMember(tenant.id, projectId, user.id, dto);
  }

  @Patch(':projectId/members/:userId')
  @UseGuards(ProjectMemberGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update project member role' })
  @ApiResponse({ status: 200, description: 'Project member role updated' })
  async updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateProjectMemberRoleDto
  ): Promise<ProjectMemberResponse> {
    return this.projectsService.updateMemberRole(projectId, user.id, targetUserId, dto.role);
  }

  @Delete(':projectId/members/:userId')
  @UseGuards(ProjectMemberGuard)
  @ProjectRoles(ProjectRole.PROJECT_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from project' })
  @ApiResponse({ status: 200, description: 'Member removed from project' })
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string
  ): Promise<{ message: string }> {
    return this.projectsService.removeMember(projectId, user.id, targetUserId);
  }
}
