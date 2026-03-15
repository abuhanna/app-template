import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { UserService } from '../../services/user.service';
import { DepartmentsService } from '../../services/departments.service';
import { AuditLogsService } from '../../services/audit-logs.service';
import { NotificationsService } from '../../services/notifications.service';
import { SkipTransform } from '../../common/decorators/response-message.decorator';

@ApiTags('Export')
@Controller('export')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly userService: UserService,
    private readonly departmentsService: DepartmentsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('users')
  @SkipTransform()
  @ApiOperation({ summary: 'Export users' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportUsers(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const isActiveFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const deptId = departmentId ? parseInt(departmentId, 10) : undefined;

    const result = await this.userService.findAllPaginated(1, 10000, undefined, undefined, search, isActiveFilter, deptId);
    const data = result.data;

    const buffer = await this.exportService.exportData(data, format);
    const contentType = this.exportService.getContentType(format);
    const ext = this.exportService.getExtension(format);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="users_${timestamp}.${ext}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.end(buffer);
  }

  @Get('departments')
  @SkipTransform()
  @ApiOperation({ summary: 'Export departments' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportDepartments(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    const result = await this.departmentsService.findAllPaginated(1, 10000, undefined, undefined, search, isActiveFilter);
    const data = result.data;

    const buffer = await this.exportService.exportData(data, format);
    const contentType = this.exportService.getContentType(format);
    const ext = this.exportService.getExtension(format);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="departments_${timestamp}.${ext}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.end(buffer);
  }

  @Get('audit-logs')
  @SkipTransform()
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportAuditLogs(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const result = await this.auditLogsService.findAll(
      1, 10000, undefined, undefined, undefined,
      entityType, undefined, undefined, action, fromDate, toDate,
    );
    const data = result.data;

    const buffer = await this.exportService.exportData(data, format);
    const contentType = this.exportService.getContentType(format);
    const ext = this.exportService.getExtension(format);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="audit-logs_${timestamp}.${ext}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.end(buffer);
  }

  @Get('notifications')
  @SkipTransform()
  @ApiOperation({ summary: 'Export notifications' })
  @ApiResponse({ status: 200, description: 'File download' })
  async exportNotifications(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
  ) {
    // Export all notifications (admin export, not user-specific)
    const result = await this.notificationsService.findAllByUser(
      0, 1, 10000, undefined, undefined, false,
    );
    const data = result.data;

    const buffer = await this.exportService.exportData(data, format);
    const contentType = this.exportService.getContentType(format);
    const ext = this.exportService.getExtension(format);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="notifications_${timestamp}.${ext}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.end(buffer);
  }
}
