import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetAuditLogsQuery } from '../application/queries/get-audit-logs.query';
import { AuditLogDto, GetAuditLogsQueryDto } from '../application/dto/audit-log.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AuditLogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLogDto],
  })
  async getAuditLogs(@Query() queryDto: GetAuditLogsQueryDto): Promise<AuditLogDto[]> {
    const query = new GetAuditLogsQuery(
      queryDto.entityName,
      queryDto.entityId,
      queryDto.userId,
      queryDto.action,
      queryDto.fromDate ? new Date(queryDto.fromDate) : undefined,
      queryDto.toDate ? new Date(queryDto.toDate) : undefined,
      queryDto.page,
      queryDto.pageSize,
    );

    return this.queryBus.execute(query);
  }
}
