import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService, PdfReportOptions } from './export.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user-management/infrastructure/entities/user.entity';
import { DepartmentEntity } from '../department-management/infrastructure/entities/department.entity';
import { AuditLogEntity } from '../audit-log/infrastructure/entities/audit-log.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Export users to CSV, Excel, or PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async exportUsers(
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: number,
    @Query('isActive') isActive?: string,
    @CurrentUser() currentUser?: any,
    @Res() res?: Response,
  ) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department');

    if (search) {
      query.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (departmentId) {
      query.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const users = await query.getMany();

    const exportData = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-',
      role: user.role,
      departmentName: user.department?.name || '-',
      isActive: user.isActive ? 'Yes' : 'No',
      createdAt: user.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
      lastLoginAt: user.lastLoginAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
    }));

    const result = await this.getExportResult(
      format,
      exportData,
      'users',
      'Users Report',
      {
        subtitle: this.buildFilterDescription(search, departmentId, isActive),
        generatedBy: currentUser?.username || 'System',
      },
    );

    this.sendResponse(res, result);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Export departments to CSV, Excel, or PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async exportDepartments(
    @Query('format') format: string = 'xlsx',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @CurrentUser() currentUser?: any,
    @Res() res?: Response,
  ) {
    const query = this.departmentRepository.createQueryBuilder('department');

    if (search) {
      query.andWhere(
        '(department.name ILIKE :search OR department.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      query.andWhere('department.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const departments = await query.getMany();

    const exportData = departments.map((dept) => ({
      id: dept.id,
      code: dept.code,
      name: dept.name,
      description: dept.description || '-',
      isActive: dept.isActive ? 'Yes' : 'No',
      createdAt: dept.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
    }));

    const result = await this.getExportResult(
      format,
      exportData,
      'departments',
      'Departments Report',
      {
        generatedBy: currentUser?.username || 'System',
      },
    );

    this.sendResponse(res, result);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Export audit logs to CSV, Excel, or PDF' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] })
  @ApiQuery({ name: 'entityName', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async exportAuditLogs(
    @Query('format') format: string = 'xlsx',
    @Query('entityName') entityName?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit: number = 1000,
    @CurrentUser() currentUser?: any,
    @Res() res?: Response,
  ) {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .orderBy('auditLog.timestamp', 'DESC')
      .take(limit);

    if (entityName) {
      query.andWhere('auditLog.entityName = :entityName', { entityName });
    }

    if (action) {
      query.andWhere('auditLog.action = :action', { action });
    }

    if (fromDate) {
      query.andWhere('auditLog.timestamp >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      query.andWhere('auditLog.timestamp <= :toDate', { toDate: new Date(toDate) });
    }

    const auditLogs = await query.getMany();

    const exportData = auditLogs.map((log) => ({
      id: log.id,
      entityName: log.entityName,
      entityId: log.entityId,
      action: log.action,
      userId: log.userId || '-',
      timestamp: log.timestamp?.toISOString().replace('T', ' ').split('.')[0] || '-',
      affectedColumns: log.affectedColumns || '-',
    }));

    const result = await this.getExportResult(
      format,
      exportData,
      'audit_logs',
      'Audit Log Report',
      {
        subtitle: `Entity: ${entityName || 'All'}, Action: ${action || 'All'}`,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        generatedBy: currentUser?.username || 'System',
      },
    );

    this.sendResponse(res, result);
  }

  private async getExportResult(
    format: string,
    data: any[],
    fileName: string,
    reportTitle: string,
    options: PdfReportOptions,
  ) {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportService.exportToCsv(data, fileName);
      case 'pdf':
        return this.exportService.exportToPdf(data, fileName, reportTitle, options);
      default:
        return this.exportService.exportToExcel(data, fileName);
    }
  }

  private sendResponse(res: Response, result: { buffer: Buffer; contentType: string; fileName: string }) {
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
    });
    res.send(result.buffer);
  }

  private buildFilterDescription(search?: string, departmentId?: number, isActive?: string): string {
    const filters: string[] = [];

    if (isActive !== undefined) {
      filters.push(`Status: ${isActive === 'true' ? 'Active' : 'Inactive'}`);
    }

    if (departmentId) {
      filters.push(`Department ID: ${departmentId}`);
    }

    if (search) {
      filters.push(`Search: "${search}"`);
    }

    return filters.length > 0 ? filters.join(' | ') : 'All Users';
  }
}
