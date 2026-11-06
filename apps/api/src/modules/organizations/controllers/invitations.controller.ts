import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { InvitationsService } from '../services/invitations.service';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

@ApiTags('Invitations')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
@ApiCookieAuth('access_token')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation to join an organization' })
  @ApiResponse({ status: 200, description: 'Invitation accepted and membership established' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation token' })
  @ApiResponse({ status: 403, description: 'Email address does not match invitation' })
  async acceptInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AcceptInvitationDto
  ): Promise<{ message: string; organizationId: string }> {
    return this.invitationsService.acceptInvitation(user.id, user.email, dto);
  }
}
