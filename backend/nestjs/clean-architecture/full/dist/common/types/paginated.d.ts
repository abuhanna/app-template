export declare class PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export declare class PagedResult<T> {
    items: T[];
    pagination: PaginationMeta;
}
export interface PaginationQuery {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
}
export declare function createPagedResult<T>(items: T[], totalItems: number, page: number, pageSize: number): PagedResult<T>;
