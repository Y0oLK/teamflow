import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4e5...', description: 'Password reset token received via email' })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;

  @ApiProperty({
    example: 'NewSecurePass123!',
    description: 'New password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)',
  })
  @IsString()
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }
  )
  newPassword!: string;
}

