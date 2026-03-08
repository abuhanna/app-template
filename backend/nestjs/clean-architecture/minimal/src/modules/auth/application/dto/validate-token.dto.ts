import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTokenDto {
  @ApiProperty({ description: 'External JWT or SSO token to validate' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
