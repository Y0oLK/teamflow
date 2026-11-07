import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddDependencyDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Task ID that must be completed BEFORE this task can proceed',
  })
  @IsNotEmpty({ message: 'Prerequisite task ID is required' })
  @IsUUID('4', { message: 'Prerequisite task ID must be a valid UUIDv4' })
  dependsOnTaskId!: string;
}
