import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubtaskDto {
  @ApiProperty({ example: 'Write unit tests for edge cases', description: 'Checklist item title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  title!: string;

  @ApiPropertyOptional({ example: 0, description: 'Position within checklist' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
