import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AuditLog } from '../../common/audit/audit-log.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Notification])],
  providers: [ExportService],
  controllers: [ExportController],
  exports: [ExportService],
})
export class ExportModule {}
