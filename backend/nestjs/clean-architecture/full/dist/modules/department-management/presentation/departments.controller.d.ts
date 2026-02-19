import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaginationQueryDto } from '@/common/dto';
import { PagedResult } from '@/common/types/paginated';
import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto } from '../application/dto';
export declare class DepartmentsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findAll(queryDto: PaginationQueryDto): Promise<PagedResult<DepartmentDto>>;
    findOne(id: number): Promise<DepartmentDto>;
    create(dto: CreateDepartmentDto): Promise<DepartmentDto>;
    update(id: number, dto: UpdateDepartmentDto): Promise<DepartmentDto>;
    delete(id: number): Promise<void>;
}
