import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { DepartmentsService } from '../../services/departments.service';
import { AuditLogsService } from '../../services/audit-logs.service';
import { NotificationsService } from '../../services/notifications.service';
import { User } from '../../entities/user.entity';
import { Department } from '../../entities/department.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department, AuditLog, Notification]),
  ],
  providers: [
    ExportService,
    UserService,
    UserRepository,
    DepartmentsService,
    AuditLogsService,
    NotificationsService,
  ],
  controllers: [ExportController],
  exports: [ExportService],
})
export class ExportModule {}
