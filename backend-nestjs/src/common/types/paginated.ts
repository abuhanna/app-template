import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  totalItems: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPrevious: boolean;
}

export class PagedResult<T> {
  @ApiProperty({ description: 'Array of items', isArray: true })
  items: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMeta })
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export function createPagedResult<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number,
): PagedResult<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}
