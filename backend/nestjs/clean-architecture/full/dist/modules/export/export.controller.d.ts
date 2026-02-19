import { Response } from 'express';
import { ExportService } from './export.service';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../department-management/infrastructure/persistence/department.orm-entity';
import { AuditLogOrmEntity } from '../audit-log/infrastructure/persistence/audit-log.orm-entity';
export declare class ExportController {
    private readonly exportService;
    private readonly userRepository;
    private readonly departmentRepository;
    private readonly auditLogRepository;
    constructor(exportService: ExportService, userRepository: Repository<UserOrmEntity>, departmentRepository: Repository<DepartmentOrmEntity>, auditLogRepository: Repository<AuditLogOrmEntity>);
    exportUsers(res: Response, format?: string, search?: string, departmentId?: number, isActive?: string, currentUser?: any): Promise<void>;
    exportDepartments(res: Response, format?: string, search?: string, isActive?: string, currentUser?: any): Promise<void>;
    exportAuditLogs(res: Response, format?: string, entityName?: string, action?: string, fromDate?: string, toDate?: string, limit?: number, currentUser?: any): Promise<void>;
    private getExportResult;
    private sendResponse;
    private buildFilterDescription;
}
