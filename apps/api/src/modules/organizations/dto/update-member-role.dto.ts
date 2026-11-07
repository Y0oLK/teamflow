import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrgRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: OrgRole,
    example: OrgRole.ORG_ADMIN,
    description: 'New organization role (ORG_OWNER, ORG_ADMIN, ORG_MEMBER, ORG_GUEST)',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(OrgRole, { message: 'Invalid organization role' })
  role!: OrgRole;
}

