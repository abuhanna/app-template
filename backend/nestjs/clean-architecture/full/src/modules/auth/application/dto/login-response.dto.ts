import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '@/modules/user-management/application/dto/user.dto';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiPropertyOptional({ description: 'User information (included on login/register, omitted on refresh)' })
  user?: UserDto;

  constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user?: UserDto,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    if (user) {
      this.user = user;
    }
  }
}
