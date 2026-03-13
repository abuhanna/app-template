import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import {
  ValidateTokenDto,
  ValidateTokenResponseDto,
  UpdateProfileDto,
  UserInfoDto,
} from '../application/dto';
import { ValidateTokenCommand } from '../application/commands/validate-token.command';
import { UpdateProfileCommand } from '../application/commands/update-profile.command';
import { GetMyProfileQuery } from '../application/queries/get-my-profile.query';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('validate-token')
  @Throttle({ short: { ttl: 1000, limit: 3 }, medium: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate external JWT/SSO token' })
  @ApiResponse({ status: 200, type: ValidateTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired external token' })
  @ResponseMessage('Token validated')
  async validateToken(@Body() dto: ValidateTokenDto): Promise<ValidateTokenResponseDto> {
    return this.commandBus.execute(new ValidateTokenCommand(dto.token));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info from JWT' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  @ResponseMessage('User info retrieved')
  async me(@CurrentUser() user: CurrentUserPayload): Promise<UserInfoDto> {
    return new UserInfoDto({
      id: user.sub,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get full user profile from database' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  @ResponseMessage('Profile retrieved')
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserInfoDto> {
    return this.queryBus.execute(new GetMyProfileQuery(user.sub));
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, type: UserInfoDto })
  @ResponseMessage('Profile updated successfully')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserInfoDto> {
    return this.commandBus.execute(
      new UpdateProfileCommand(user.sub, dto.firstName, dto.lastName),
    );
  }
}
