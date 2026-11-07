import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Mobile App 2.0', description: 'Updated project name' })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Project name must be between 2 and 100 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated roadmap and sprint goals',
    description: 'Updated project description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  description?: string;
}
