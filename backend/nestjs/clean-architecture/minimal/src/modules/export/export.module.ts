import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { AuditLogOrmEntity } from '../audit-log/infrastructure/persistence/audit-log.orm-entity';
import { NotificationOrmEntity } from '../notification/infrastructure/persistence/notification.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogOrmEntity, NotificationOrmEntity]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
