import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'inv_token_hex_12345...', description: 'Raw invitation token' })
  @IsString()
  @IsNotEmpty({ message: 'Invitation token is required' })
  token!: string;
}

