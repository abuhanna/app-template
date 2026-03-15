import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UserInfoDto,
} from '../application/dto';
import {
  LoginCommand,
  RegisterCommand,
  RefreshTokenCommand,
  LogoutCommand,
  ChangePasswordCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  UpdateProfileCommand,
} from '../application/commands';
import { GetCurrentUserQuery, GetMyProfileQuery } from '../application/queries';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 20 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ResponseMessage('Registration successful')
  async register(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    return this.commandBus.execute(
      new RegisterCommand(dto.username, dto.email, dto.password, dto.firstName, dto.lastName),
    );
  }

  @Post('login')
  @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 60000, limit: 30 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ResponseMessage('Login successful')
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const identifier = dto.username || dto.email;
    if (!identifier) {
      throw new BadRequestException('Username or email is required');
    }
    return this.commandBus.execute(new LoginCommand(identifier, dto.password));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ResponseMessage('Token refreshed')
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
  @ResponseMessage('User info retrieved')
  async me(@CurrentUser() user: CurrentUserPayload): Promise<UserInfoDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.sub));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  @ResponseMessage('Profile retrieved')
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserInfoDto> {
    return this.queryBus.execute(new GetMyProfileQuery(user.sub));
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  @ResponseMessage('Profile updated')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserInfoDto> {
    return this.commandBus.execute(
      new UpdateProfileCommand(user.sub, dto.firstName, dto.lastName, dto.email),
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Passwords do not match' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ResponseMessage('Password changed successfully')
  async changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.commandBus.execute(
      new ChangePasswordCommand(user.sub, dto.currentPassword, dto.newPassword),
    );
  }

  @Post('forgot-password')
  @Throttle({ short: { ttl: 1000, limit: 1 }, medium: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  @ResponseMessage('If your email is registered, you will receive a password reset link')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.commandBus.execute(new RequestPasswordResetCommand(dto.email));
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ResponseMessage('Password reset successful')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    await this.commandBus.execute(new ResetPasswordCommand(dto.token, dto.newPassword));
  }
}
