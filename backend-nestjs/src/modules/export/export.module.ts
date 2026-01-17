import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UserEntity } from '../user-management/infrastructure/entities/user.entity';
import { DepartmentEntity } from '../department-management/infrastructure/entities/department.entity';
import { AuditLogEntity } from '../audit-log/infrastructure/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DepartmentEntity, AuditLogEntity]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
