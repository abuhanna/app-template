import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import { AuditLog } from '../../common/audit/audit-log.entity';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async exportAuditLogs(
    format: string,
    entityName?: string,
    action?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const qb = this.auditLogRepository.createQueryBuilder('audit');

    if (entityName) {
      qb.andWhere('audit.entityName = :entityName', { entityName });
    }

    if (action) {
      qb.andWhere('audit.action = :action', { action });
    }

    if (fromDate) {
      qb.andWhere('audit.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      qb.andWhere('audit.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    qb.orderBy('audit.createdAt', 'DESC');
    const logs = await qb.getMany();
    const data = logs.map(l => ({
      ID: l.id,
      Action: l.action,
      'Entity Name': l.entityName,
      'Entity ID': l.entityId || '',
      'User ID': l.userId || '',
      'User Name': l.userName || '',
      Details: l.details || '',
      'IP Address': l.ipAddress || '',
      'Created At': l.createdAt?.toISOString() || '',
    }));

    return this.generateFile(data, format, 'audit_logs');
  }

  async exportNotifications(
    format: string,
    userId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const data = notifications.map(n => ({
      ID: n.id,
      Title: n.title,
      Message: n.message,
      Type: n.type,
      Read: n.isRead ? 'Yes' : 'No',
      'Created At': n.createdAt?.toISOString() || '',
    }));

    return this.generateFile(data, format, 'notifications');
  }

  private async generateFile(
    data: any[],
    format: string,
    name: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

    switch (format) {
      case 'csv': {
        const csvString = stringify(data, { header: true });
        return {
          buffer: Buffer.from(csvString),
          contentType: 'text/csv',
          fileName: `${name}_${dateStr}.csv`,
        };
      }
      case 'pdf': {
        // For PDF, export as CSV since pdfkit is not a dependency
        const csvString = stringify(data, { header: true });
        return {
          buffer: Buffer.from(csvString),
          contentType: 'text/csv',
          fileName: `${name}_${dateStr}.csv`,
        };
      }
      default: {
        // xlsx
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(name);

        if (data.length > 0) {
          const columns = Object.keys(data[0]).map((key) => ({ header: key, key, width: 20 }));
          worksheet.columns = columns;
          worksheet.addRows(data);

          // Style header row
          worksheet.getRow(1).font = { bold: true };
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return {
          buffer: Buffer.from(buffer),
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileName: `${name}_${dateStr}.xlsx`,
        };
      }
    }
  }
}
