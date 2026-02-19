import { UserRole } from '../../domain/value-objects/user-role';
export declare class UpdateUserDto {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    departmentId?: number | null;
    isActive?: boolean;
}
