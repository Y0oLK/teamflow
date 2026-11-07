import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class MoveTaskDto {
  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Target Kanban column status',
  })
  @IsNotEmpty({ message: 'Target status is required' })
  @IsEnum(TaskStatus, { message: 'Invalid status' })
  status!: TaskStatus;

  @ApiProperty({
    example: 'a0V',
    description: 'Fractional index order key positioned between adjacent cards',
  })
  @IsNotEmpty({ message: 'Order key is required' })
  @IsString()
  @Length(1, 255, { message: 'Order key must be between 1 and 255 characters' })
  orderKey!: string;

  @ApiProperty({
    example: 1,
    description: 'Current task version number for Optimistic Concurrency Control (OCC)',
  })
  @IsNotEmpty({ message: 'Version is required for OCC validation' })
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be at least 1' })
  version!: number;
}
