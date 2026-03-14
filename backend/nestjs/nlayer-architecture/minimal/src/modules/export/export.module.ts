import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AuditLogsService } from '../../services/audit-logs.service';
import { NotificationsService } from '../../services/notifications.service';
import { AuditLog } from '../../entities/audit-log.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Notification]),
  ],
  providers: [
    ExportService,
    AuditLogsService,
    NotificationsService,
  ],
  controllers: [ExportController],
  exports: [ExportService],
})
export class ExportModule {}
