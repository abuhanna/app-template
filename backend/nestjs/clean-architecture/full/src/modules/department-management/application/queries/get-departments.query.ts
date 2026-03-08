import { IQuery } from '@nestjs/cqrs';

export class GetDepartmentsQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly pageSize: number = 10,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly search?: string,
  ) {}
}
