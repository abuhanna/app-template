import { User } from '../../domain/entities/user.entity';
import { UserDto } from '../dto/user.dto';
export declare class UserMapper {
    static toDto(user: User, departmentName?: string | null): UserDto;
    static toDtoList(users: User[]): UserDto[];
}
