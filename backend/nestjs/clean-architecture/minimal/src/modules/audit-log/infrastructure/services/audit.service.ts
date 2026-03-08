import { Injectable, Logger } from '@nestjs/common';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async logCreate(
    entityType: string,
    entityId: string,
    newValues: object,
    userId?: number,
    userName?: string,
    details?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityType,
        entityId,
        AuditAction.CREATE,
        null,
        JSON.stringify(newValues),
        null,
        userId ?? null,
        userName,
        details,
        ipAddress,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log create audit for ${entityType} ${entityId}: ${error.message}`);
    }
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    oldValues: object | null,
    newValues: object,
    affectedColumns?: string[],
    userId?: number,
    userName?: string,
    details?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityType,
        entityId,
        AuditAction.UPDATE,
        oldValues ? JSON.stringify(oldValues) : null,
        JSON.stringify(newValues),
        affectedColumns ? JSON.stringify(affectedColumns) : null,
        userId ?? null,
        userName,
        details,
        ipAddress,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log update audit for ${entityType} ${entityId}: ${error.message}`);
    }
  }

  async logDelete(
    entityType: string,
    entityId: string,
    oldValues: object,
    userId?: number,
    userName?: string,
    details?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        entityType,
        entityId,
        AuditAction.DELETE,
        JSON.stringify(oldValues),
        null,
        null,
        userId ?? null,
        userName,
        details,
        ipAddress,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log delete audit for ${entityType} ${entityId}: ${error.message}`);
    }
  }

  async logLogin(userId: number, userName?: string, ipAddress?: string): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        'User',
        String(userId),
        AuditAction.LOGIN,
        null,
        null,
        null,
        userId,
        userName,
        'User logged in',
        ipAddress,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log login audit for user ${userId}: ${error.message}`);
    }
  }

  async logLogout(userId: number, userName?: string, ipAddress?: string): Promise<void> {
    try {
      const auditLog = AuditLog.create(
        'User',
        String(userId),
        AuditAction.LOGOUT,
        null,
        null,
        null,
        userId,
        userName,
        'User logged out',
        ipAddress,
      );
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.warn(`Failed to log logout audit for user ${userId}: ${error.message}`);
    }
  }
}
