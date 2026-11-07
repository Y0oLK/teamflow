import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex', description: 'Updated first name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ example: 'Vance', description: 'Updated last name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: string | undefined }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.teamflow.local/avatars/u1.png', description: 'User avatar URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;
}

