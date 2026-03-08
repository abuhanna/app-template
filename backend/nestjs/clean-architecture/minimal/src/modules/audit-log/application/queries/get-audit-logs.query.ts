import { IQuery } from '@nestjs/cqrs';

export class GetAuditLogsQuery implements IQuery {
  constructor(
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly userId?: string,
    public readonly action?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly page: number = 1,
    public readonly pageSize: number = 10,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly search?: string,
  ) {}
}
