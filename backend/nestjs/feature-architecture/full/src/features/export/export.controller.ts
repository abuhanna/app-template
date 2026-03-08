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

  @Get('users')
  @SkipTransform()
  @ApiOperation({ summary: 'Export users' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportUsers(
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('departmentId') departmentId?: string,
    @Res() res?: Response,
  ) {
    const { buffer, contentType, fileName } = await this.exportService.exportUsers(format, search, isActive, departmentId);
    res!.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res!.end(buffer);
  }

  @Get('departments')
  @SkipTransform()
  @ApiOperation({ summary: 'Export departments' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportDepartments(
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Res() res?: Response,
  ) {
    const { buffer, contentType, fileName } = await this.exportService.exportDepartments(format, search, isActive);
    res!.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res!.end(buffer);
  }

  @Get('audit-logs')
  @SkipTransform()
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportAuditLogs(
    @Query('format') format: string = 'xlsx',
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Res() res?: Response,
  ) {
    const { buffer, contentType, fileName } = await this.exportService.exportAuditLogs(format, entityType, action, fromDate, toDate);
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
