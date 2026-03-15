import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportService, PdfReportOptions } from './export.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogOrmEntity } from '../audit-log/infrastructure/persistence/audit-log.orm-entity';
import { NotificationOrmEntity } from '../notification/infrastructure/persistence/notification.orm-entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipTransform } from '../../common/decorators/response-message.decorator';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditLogRepository: Repository<AuditLogOrmEntity>,
    @InjectRepository(NotificationOrmEntity)
    private readonly notificationRepository: Repository<NotificationOrmEntity>,
  ) {}

  @Get('audit-logs')
  @SkipTransform()
  @ApiOperation({ summary: 'Export audit logs to CSV, Excel, or PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] })
  @ApiQuery({ name: 'entityName', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async exportAuditLogs(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
    @Query('entityName') entityName?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit: string = '1000',
    @CurrentUser() currentUser?: any,
  ) {
    const numericLimit = parseInt(limit, 10) || 1000;
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .orderBy('auditLog.createdAt', 'DESC')
      .take(numericLimit);

    if (entityName) {
      query.andWhere('auditLog.entityName = :entityName', { entityName });
    }

    if (action) {
      query.andWhere('auditLog.action = :action', { action });
    }

    if (fromDate) {
      query.andWhere('auditLog.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      query.andWhere('auditLog.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    const auditLogs = await query.getMany();

    const exportData = auditLogs.map((log) => ({
      id: log.id,
      entityName: log.entityName,
      entityId: log.entityId,
      action: log.action,
      userId: log.userId || '-',
      userName: log.userName || '-',
      details: log.details || '-',
      ipAddress: log.ipAddress || '-',
      createdAt: log.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
    }));

    const result = await this.getExportResult(
      format,
      exportData,
      'audit_logs',
      'Audit Log Report',
      {
        subtitle: `Entity: ${entityName || 'All'}, Action: ${action || 'All'}`,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        generatedBy: currentUser?.username || 'System',
      },
    );

    this.sendResponse(res, result);
  }

  @Get('notifications')
  @SkipTransform()
  @ApiOperation({ summary: 'Export notifications to CSV, Excel, or PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] })
  async exportNotifications(
    @Res() res: Response,
    @Query('format') format: string = 'xlsx',
    @CurrentUser() currentUser?: any,
  ) {
    const userId = currentUser?.sub;

    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const exportData = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead ? 'Yes' : 'No',
      readAt: n.readAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
      createdAt: n.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
    }));

    const result = await this.getExportResult(
      format,
      exportData,
      'notifications',
      'Notifications Report',
      {
        generatedBy: currentUser?.username || 'System',
      },
    );

    this.sendResponse(res, result);
  }

  private async getExportResult(
    format: string,
    data: any[],
    fileName: string,
    reportTitle: string,
    options: PdfReportOptions,
  ) {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportService.exportToCsv(data, fileName);
      case 'pdf':
        return this.exportService.exportToPdf(data, fileName, reportTitle, options);
      default:
        return this.exportService.exportToExcel(data, fileName);
    }
  }

  private sendResponse(res: Response, result: { buffer: Buffer; contentType: string; fileName: string }) {
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
    });
    res.send(result.buffer);
  }
}
