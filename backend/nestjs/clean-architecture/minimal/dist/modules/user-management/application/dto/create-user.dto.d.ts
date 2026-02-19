import { UserRole } from '../../domain/value-objects/user-role';
export declare class CreateUserDto {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId?: number;
}
