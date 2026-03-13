import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { SkipTransform } from '../../common/decorators/response-message.decorator';

@ApiTags('Export')
@Controller('export')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('audit-logs')
  @SkipTransform()
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportAuditLogs(
    @Query('format') format: string = 'xlsx',
    @Query('entityName') entityName?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Res() res?: Response,
  ) {
    const { buffer, contentType, fileName } = await this.exportService.exportAuditLogs(format, entityName, action, fromDate, toDate);
    res!.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res!.end(buffer);
  }

  @Get('notifications')
  @SkipTransform()
  @ApiOperation({ summary: 'Export notifications' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportNotifications(
    @Query('format') format: string = 'xlsx',
    @Request() req?: any,
    @Res() res?: Response,
  ) {
    const { buffer, contentType, fileName } = await this.exportService.exportNotifications(format, req!.user.userId);
    res!.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res!.end(buffer);
  }
}
