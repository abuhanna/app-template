import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { PagedResult } from '@/common/types/paginated';
import { UserRole } from '@/modules/user-management/domain/value-objects/user-role';
import { GetAuditLogsQuery } from '../application/queries/get-audit-logs.query';
import { AuditLogDto, GetAuditLogsQueryDto } from '../application/dto/audit-log.dto';
import { IAuditLogRepository } from '../domain/interfaces/audit-log.repository.interface';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AuditLogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  @Get()
  @ResponseMessage('Audit logs retrieved successfully')
  @ApiOperation({ summary: 'Get audit logs with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit logs retrieved successfully',
  })
  async getAuditLogs(@Query() queryDto: GetAuditLogsQueryDto): Promise<PagedResult<AuditLogDto>> {
    const query = new GetAuditLogsQuery(
      queryDto.entityType,
      queryDto.entityId,
      queryDto.userId,
      queryDto.action,
      queryDto.fromDate ? new Date(queryDto.fromDate) : undefined,
      queryDto.toDate ? new Date(queryDto.toDate) : undefined,
      queryDto.page,
      queryDto.pageSize,
      queryDto.sortBy,
      queryDto.sortOrder,
      queryDto.search,
    );

    return this.queryBus.execute(query);
  }

  @Get(':id')
  @ResponseMessage('Audit log retrieved successfully')
  @ApiOperation({ summary: 'Get audit log by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getAuditLogById(@Param('id', ParseIntPipe) id: number): Promise<AuditLogDto> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return {
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId !== null ? String(log.userId) : null,
      userName: log.userName,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    };
  }
}
