import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Mobile App MVP', description: 'Project name' })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @Length(2, 100, { message: 'Project name must be between 2 and 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiProperty({
    example: 'APP',
    description: 'Project key (2 to 10 uppercase alphanumeric characters used for task identifiers, e.g. APP-101)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Project key is required' })
  @Length(2, 10, { message: 'Project key must be between 2 and 10 characters' })
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: 'Project key must contain only uppercase letters and numbers (2-10 characters)',
  })
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  key!: string;

  @ApiPropertyOptional({
    example: 'Next-generation iOS and Android client development',
    description: 'Detailed project description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  description?: string;
}
