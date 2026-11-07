import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement WebSocket Gateway', description: 'Task title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  title!: string;

  @ApiPropertyOptional({
    example: 'Set up Redis adapter and room-based event broadcasting',
    description: 'Detailed task markdown description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    description: 'Task priority level (LOW, MEDIUM, HIGH, URGENT)',
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid priority level' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    enum: TaskStatus,
    default: TaskStatus.TODO,
    description: 'Initial task status (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)',
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid status' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    example: '2026-12-01T12:00:00.000Z',
    description: 'Task due date in ISO 8601 format',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueDate?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    description: 'List of user IDs assigned to the task (must be project members)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUIDv4' })
  assigneeIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Configure Redis socket.io adapter', 'Implement ping/pong heartbeat'],
    description: 'Initial checklist items (single-level subtasks)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  subtasks?: string[];
}
