import { Injectable, Logger } from '@nestjs/common';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async logCreate(
    entityName: string,
    entityId: string,
    newValues: object,
    userId?: number,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityName,
        entityId,
        AuditAction.CREATED,
        null,
        JSON.stringify(newValues),
        null,
        userId ?? null,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log create audit for ${entityName} ${entityId}: ${error.message}`);
    }
  }

  async logUpdate(
    entityName: string,
    entityId: string,
    oldValues: object | null,
    newValues: object,
    affectedColumns?: string[],
    userId?: number,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityName,
        entityId,
        AuditAction.UPDATED,
        oldValues ? JSON.stringify(oldValues) : null,
        JSON.stringify(newValues),
        affectedColumns ? JSON.stringify(affectedColumns) : null,
        userId ?? null,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log update audit for ${entityName} ${entityId}: ${error.message}`);
    }
  }

  async logDelete(
    entityName: string,
    entityId: string,
    oldValues: object,
    userId?: number,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityName,
        entityId,
        AuditAction.DELETED,
        JSON.stringify(oldValues),
        null,
        null,
        userId ?? null,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log delete audit for ${entityName} ${entityId}: ${error.message}`);
    }
  }
}
