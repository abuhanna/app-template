import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PagedResult } from '@/common/types/paginated';
import { UserRole } from '@/modules/user-management/domain/value-objects/user-role';
import { GetAuditLogsQuery } from '../application/queries/get-audit-logs.query';
import { AuditLogDto, GetAuditLogsQueryDto } from '../application/dto/audit-log.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AuditLogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit logs retrieved successfully',
  })
  async getAuditLogs(@Query() queryDto: GetAuditLogsQueryDto): Promise<PagedResult<AuditLogDto>> {
    const query = new GetAuditLogsQuery(
      queryDto.entityName,
      queryDto.entityId,
      queryDto.userId,
      queryDto.action,
      queryDto.fromDate ? new Date(queryDto.fromDate) : undefined,
      queryDto.toDate ? new Date(queryDto.toDate) : undefined,
      queryDto.page,
      queryDto.pageSize,
      queryDto.sortBy,
      queryDto.sortDir,
      queryDto.search,
    );

    return this.queryBus.execute(query);
  }
}
