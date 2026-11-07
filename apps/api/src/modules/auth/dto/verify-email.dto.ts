import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'f8e7d6c5b4...', description: 'Email verification token' })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token!: string;
}

