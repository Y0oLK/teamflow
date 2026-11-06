import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Organization display name' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  @Length(2, 100, { message: 'Organization name must be between 2 and 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiPropertyOptional({
    example: 'acme-corp',
    description: 'Unique URL slug (lowercase alphanumeric with hyphens). Auto-generated if omitted.',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Slug must be between 2 and 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and single hyphens without leading or trailing hyphens',
  })
  @Transform(({ value }: { value: string | undefined }) => value?.trim().toLowerCase())
  slug?: string;
}
