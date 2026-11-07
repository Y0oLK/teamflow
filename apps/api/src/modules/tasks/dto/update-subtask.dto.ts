import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSubtaskDto {
  @ApiPropertyOptional({ example: 'Updated checklist title', description: 'Checklist item title' })
  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ example: true, description: 'Completion status' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Position in checklist' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
