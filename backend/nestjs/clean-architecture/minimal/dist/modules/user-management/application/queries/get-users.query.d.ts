import { IQuery } from '@nestjs/cqrs';
export declare class GetUsersQuery implements IQuery {
    readonly page: number;
    readonly pageSize: number;
    readonly sortBy?: string | undefined;
    readonly sortDir?: "asc" | "desc" | undefined;
    readonly search?: string | undefined;
    constructor(page?: number, pageSize?: number, sortBy?: string | undefined, sortDir?: "asc" | "desc" | undefined, search?: string | undefined);
}
