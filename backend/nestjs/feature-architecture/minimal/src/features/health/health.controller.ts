import {
  Controller,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      application: 'AppTemplate API',
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch {
      throw new HttpException(
        {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
