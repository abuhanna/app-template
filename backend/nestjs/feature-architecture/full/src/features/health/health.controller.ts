import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { SkipTransform } from '../../common/decorators/response-message.decorator';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @SkipTransform()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @SkipTransform()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async ready(@Res() res: Response) {
    try {
      await this.dataSource.query('SELECT 1');
      return res.status(HttpStatus.OK).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      });
    } catch {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      });
    }
  }

  @Get('live')
  @SkipTransform()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
