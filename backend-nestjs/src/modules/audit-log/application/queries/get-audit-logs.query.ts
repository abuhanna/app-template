import { IQuery } from '@nestjs/cqrs';

export class GetAuditLogsQuery implements IQuery {
  constructor(
    public readonly entityName?: string,
    public readonly entityId?: string,
    public readonly userId?: number,
    public readonly action?: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly page: number = 1,
    public readonly pageSize: number = 20,
  ) {}
}
