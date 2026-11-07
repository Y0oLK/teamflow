import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class UpdateProjectMemberRoleDto {
  @ApiProperty({
    enum: ProjectRole,
    example: ProjectRole.PROJECT_MANAGER,
    description: 'Updated project role (PROJECT_MANAGER, PROJECT_MEMBER, PROJECT_VIEWER)',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(ProjectRole, { message: 'Invalid project role' })
  role!: ProjectRole;
}
