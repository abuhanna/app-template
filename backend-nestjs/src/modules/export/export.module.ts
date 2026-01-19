import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UserOrmEntity } from '../user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../department-management/infrastructure/persistence/department.orm-entity';
import { AuditLogOrmEntity } from '../audit-log/infrastructure/persistence/audit-log.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, DepartmentOrmEntity, AuditLogOrmEntity]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
