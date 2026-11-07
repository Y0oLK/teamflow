import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class AddProjectMemberDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'User ID to add to project' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUIDv4' })
  userId!: string;

  @ApiPropertyOptional({
    enum: ProjectRole,
    default: ProjectRole.PROJECT_MEMBER,
    description: 'Project role (PROJECT_MANAGER, PROJECT_MEMBER, PROJECT_VIEWER)',
  })
  @IsOptional()
  @IsEnum(ProjectRole, { message: 'Invalid project role' })
  role?: ProjectRole;
}
