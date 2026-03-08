import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  UserInfoDto,
} from '../application/dto';
import {
  LoginCommand,
  RefreshTokenCommand,
  LogoutCommand,
} from '../application/commands';
import { GetCurrentUserQuery } from '../application/queries';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const identifier = dto.username || dto.email;
    if (!identifier) {
      throw new Error('Username or email is required');
    }
    return this.commandBus.execute(new LoginCommand(identifier, dto.password));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto?: RefreshTokenDto,
  ): Promise<void> {
    await this.commandBus.execute(new LogoutCommand(user.sub, dto?.refreshToken));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  async me(@CurrentUser() user: CurrentUserPayload): Promise<UserInfoDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.sub));
  }
}
