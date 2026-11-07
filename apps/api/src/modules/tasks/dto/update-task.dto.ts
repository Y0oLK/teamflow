import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskPriority } from '@prisma/client';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Refactored WebSocket Gateway', description: 'Updated title' })
  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ description: 'Updated markdown description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Updated priority' })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid priority level' })
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Updated due date in ISO 8601 format' })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueDate?: string;

  @ApiProperty({
    example: 1,
    description: 'Current task version number for Optimistic Concurrency Control (OCC)',
  })
  @IsNotEmpty({ message: 'Version is required for OCC validation' })
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be at least 1' })
  version!: number;
}
