import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from '../../services/audit-logs.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  @ResponseMessage('Audit logs retrieved successfully')
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.auditLogsService.findAll(
      query.page ?? 1,
      query.pageSize ?? 10,
      query.sortBy,
      query.sortOrder,
      query.search,
      entityType,
      entityId,
      userId,
      action,
      fromDate,
      toDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  @ApiResponse({ status: 200, description: 'Audit log entry' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ResponseMessage('Audit log retrieved successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findOne(id);
  }
}
