import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-token')
  @Throttle({ short: { ttl: 1000, limit: 3 }, medium: { ttl: 60000, limit: 10 } })
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
  @ApiOperation({ summary: 'Get current user info from JWT claims' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ResponseMessage('User info retrieved')
  async me(@Request() req: any) {
    return this.authService.getMe(req.user);
  }
}
