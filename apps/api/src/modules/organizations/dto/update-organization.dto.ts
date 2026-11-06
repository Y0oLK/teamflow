import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corp International', description: 'Updated organization name' })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Organization name must be between 2 and 100 characters' })
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.teamflow.local/orgs/acme.png', description: 'Organization logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;
}
