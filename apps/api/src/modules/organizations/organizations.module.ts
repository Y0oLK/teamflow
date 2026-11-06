import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TokenService } from '../auth/services/token.service';
import { OrganizationsController } from './controllers/organizations.controller';
import { InvitationsController } from './controllers/invitations.controller';
import { OrganizationsService } from './services/organizations.service';
import { MembersService } from './services/members.service';
import { InvitationsService } from './services/invitations.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController, InvitationsController],
  providers: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    TokenService,
    TenantGuard,
    RolesGuard,
  ],
  exports: [
    OrganizationsService,
    MembersService,
    InvitationsService,
    TenantGuard,
    RolesGuard,
  ],
})
export class OrganizationsModule {}
