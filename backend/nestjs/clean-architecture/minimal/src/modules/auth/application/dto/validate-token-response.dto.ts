import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserInfoDto } from './user-info.dto';

export class ValidateTokenResponseDto {
  @ApiProperty({ description: 'Internal JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: UserInfoDto;

  constructor(accessToken: string, expiresIn: number, user: UserInfoDto) {
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.user = user;
  }
}
