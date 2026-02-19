import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@/modules/user-management/application/dto/user.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', default: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Refresh token expiration time' })
  refreshTokenExpiresAt: Date;

  @ApiProperty({ description: 'User information' })
  user: UserDto;

  constructor(
    token: string,
    refreshToken: string,
    expiresIn: number,
    refreshTokenExpiresAt: Date,
    user: UserDto,
    tokenType: string = 'Bearer',
  ) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.refreshTokenExpiresAt = refreshTokenExpiresAt;
    this.user = user;
  }
}
