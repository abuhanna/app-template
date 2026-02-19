import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { IAuditLogRepository } from './domain/interfaces/audit-log.repository.interface';

// Application - Queries
import { GetAuditLogsHandler } from './application/queries/get-audit-logs.handler';

// Infrastructure
import { AuditLogOrmEntity } from './infrastructure/persistence/audit-log.orm-entity';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { AuditService } from './infrastructure/services/audit.service';
import { AuditSubscriber } from './infrastructure/subscribers/audit.subscriber';

// Presentation
import { AuditLogsController } from './presentation/audit-logs.controller';

const QueryHandlers = [GetAuditLogsHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [AuditLogsController],
  providers: [
    ...QueryHandlers,
    AuditService,
    AuditSubscriber,
    {
      provide: IAuditLogRepository,
      useClass: AuditLogRepository,
    },
  ],
  exports: [AuditService, IAuditLogRepository],
})
export class AuditLogModule {}
