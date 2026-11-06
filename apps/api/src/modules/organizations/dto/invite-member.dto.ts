import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrgRole } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'colleague@example.com', description: 'Email address of user to invite' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @ApiPropertyOptional({
    enum: OrgRole,
    default: OrgRole.ORG_MEMBER,
    description: 'Initial role in organization (ORG_ADMIN, ORG_MEMBER, ORG_GUEST)',
  })
  @IsOptional()
  @IsEnum(OrgRole, { message: 'Invalid organization role' })
  role?: OrgRole;
}
