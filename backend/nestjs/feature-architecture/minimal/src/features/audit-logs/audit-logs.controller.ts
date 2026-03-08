import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
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
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log found' })
  @ResponseMessage('Audit log retrieved successfully')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findById(id);
  }
}
