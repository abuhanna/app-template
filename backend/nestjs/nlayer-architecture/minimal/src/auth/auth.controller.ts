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
import { AuthService } from './auth.service';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { IsString } from 'class-validator';

class ValidateTokenDto {
  @IsString() token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate external token' })
  @ApiResponse({ status: 200, description: 'Token validated' })
  @ApiResponse({ status: 401, description: 'Invalid or expired external token' })
  @ResponseMessage('Token validated')
  async validateToken(@Body() dto: ValidateTokenDto) {
    return this.authService.validateToken(dto.token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info from JWT claims' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  @ResponseMessage('User info retrieved')
  async me(@Request() req: any) {
    return this.authService.getMe(req.user);
  }
}
