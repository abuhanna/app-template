import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate external JWT/SSO token' })
  @ApiResponse({ status: 200, description: 'Token validated' })
  @ApiResponse({ status: 401, description: 'Invalid or expired external token' })
  @ResponseMessage('Token validated')
  async validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info from JWT' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ResponseMessage('User info retrieved')
  async me(@Request() req: any) {
    return this.authService.getMe(req.user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get full user profile from database' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ResponseMessage('Profile retrieved')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ResponseMessage('Profile updated successfully')
  async updateProfile(
    @Request() req: any,
    @Body() dto: { firstName?: string; lastName?: string },
  ) {
    return this.authService.updateProfile(req.user.userId, dto);
  }
}
