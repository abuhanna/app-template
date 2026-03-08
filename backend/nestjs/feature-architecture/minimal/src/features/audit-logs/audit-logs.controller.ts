import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { AuditLog } from '../../common/audit/audit-log.entity';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('type') type?: string,
    @Query('tableName') tableName?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogsService.findAll(
      query.page ?? 1,
      query.pageSize ?? 20,
      query.sortBy,
      query.sortDir,
      query.search,
      type,
      tableName,
      fromDate,
      toDate,
    );
  }
}
