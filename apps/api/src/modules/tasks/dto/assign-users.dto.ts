import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignUsersDto {
  @ApiProperty({
    type: [String],
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    description: 'Complete list of user IDs assigned to the task',
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUIDv4' })
  userIds!: string[];
}
