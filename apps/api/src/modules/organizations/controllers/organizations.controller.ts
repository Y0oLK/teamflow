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
import { OrgRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentTenant, TenantContext } from '../../../common/decorators/current-tenant.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { OrganizationsService, OrganizationResponse } from '../services/organizations.service';
import { MembersService, MemberResponse } from '../services/members.service';
import { InvitationsService, InvitationResponse } from '../services/invitations.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class OrganizationsController {
  constructor(
    private readonly orgsService: OrganizationsService,
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization (User becomes ORG_OWNER)' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrganizationDto
  ): Promise<OrganizationResponse> {
    return this.orgsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all organizations for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user organizations' })
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<OrganizationResponse[]> {
    return this.orgsService.findAllForUser(user.id);
  }

  @Get(':orgId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get organization details and metrics' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 403, description: 'Not a member of this organization' })
  async findOne(@CurrentTenant() tenant: TenantContext): Promise<Record<string, unknown>> {
    return this.orgsService.findById(tenant.id);
  }

  @Patch(':orgId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Update organization name or avatar' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOrganizationDto
  ): Promise<OrganizationResponse> {
    return this.orgsService.update(tenant.id, user.id, dto);
  }

  @Delete(':orgId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER)
  @ApiOperation({ summary: 'Soft-delete organization (Owner only)' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  async delete(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ message: string }> {
    return this.orgsService.delete(tenant.id, user.id);
  }

  // --------------------------------------------------------------------------
  // Member Management Subroutes
  // --------------------------------------------------------------------------

  @Get(':orgId/members')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'List organization members' })
  @ApiResponse({ status: 200, description: 'Member list' })
  async getMembers(@CurrentTenant() tenant: TenantContext): Promise<MemberResponse[]> {
    return this.membersService.getMembers(tenant.id);
  }

  @Patch(':orgId/members/:memberId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Update member role (Sole-owner protection enforced)' })
  @ApiResponse({ status: 200, description: 'Member role updated' })
  async updateMemberRole(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto
  ): Promise<MemberResponse> {
    return this.membersService.updateMemberRole(tenant.id, user.id, tenant.role, memberId, dto.role);
  }

  @Delete(':orgId/members/:memberId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  async removeMember(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberId') memberId: string
  ): Promise<{ message: string }> {
    return this.membersService.removeMember(tenant.id, user.id, tenant.role, memberId);
  }

  // --------------------------------------------------------------------------
  // Invitation Management Subroutes
  // --------------------------------------------------------------------------

  @Post(':orgId/invitations')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @ApiOperation({ summary: 'Invite a new user to join the organization' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  async inviteMember(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InviteMemberDto
  ): Promise<InvitationResponse> {
    return this.invitationsService.invite(tenant.id, user.id, tenant.role, dto);
  }

  @Get(':orgId/invitations')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @ApiOperation({ summary: 'List pending invitations for the organization' })
  @ApiResponse({ status: 200, description: 'Pending invitation list' })
  async getInvitations(@CurrentTenant() tenant: TenantContext): Promise<InvitationResponse[]> {
    return this.invitationsService.getInvitations(tenant.id);
  }

  @Delete(':orgId/invitations/:invId')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles(OrgRole.ORG_OWNER, OrgRole.ORG_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked' })
  async revokeInvitation(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('invId') invId: string
  ): Promise<{ message: string }> {
    return this.invitationsService.revokeInvitation(tenant.id, user.id, invId);
  }
}
