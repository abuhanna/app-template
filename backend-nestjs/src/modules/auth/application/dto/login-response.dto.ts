import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', default: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    tokenType: string = 'Bearer',
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
  }
}
