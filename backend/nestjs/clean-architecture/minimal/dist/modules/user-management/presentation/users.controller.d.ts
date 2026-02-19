import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto';
import { PagedResult } from '@/common/types/paginated';
import { UserDto, CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../application/dto';
export declare class UsersController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findAll(queryDto: PaginationQueryDto): Promise<PagedResult<UserDto>>;
    findOne(id: number): Promise<UserDto>;
    create(dto: CreateUserDto): Promise<UserDto>;
    update(id: number, dto: UpdateUserDto): Promise<UserDto>;
    delete(id: number): Promise<void>;
    changePassword(user: CurrentUserPayload, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
