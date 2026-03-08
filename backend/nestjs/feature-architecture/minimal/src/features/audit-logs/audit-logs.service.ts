import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../common/audit/audit-log.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortDir?: 'asc' | 'desc',
    search?: string,
    type?: string,
    tableName?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<PaginatedResult<AuditLog>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (type) {
      queryBuilder.andWhere('audit.type = :type', { type });
    }

    if (tableName) {
      queryBuilder.andWhere('audit.tableName = :tableName', { tableName });
    }

    if (fromDate) {
      queryBuilder.andWhere('audit.dateTime >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.dateTime <= :toDate', { toDate: new Date(toDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit.tableName ILIKE :search OR audit.type ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const validSortFields = ['id', 'type', 'tableName', 'dateTime'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'dateTime';
    const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`audit.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
      },
    };
  }
}
