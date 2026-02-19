import { UserRole } from '../../domain/value-objects/user-role';
export declare class UpdateUserCommand {
    readonly id: number;
    readonly email?: string | undefined;
    readonly username?: string | undefined;
    readonly firstName?: string | undefined;
    readonly lastName?: string | undefined;
    readonly role?: UserRole | undefined;
    readonly departmentId?: number | null | undefined;
    readonly isActive?: boolean | undefined;
    constructor(id: number, email?: string | undefined, username?: string | undefined, firstName?: string | undefined, lastName?: string | undefined, role?: UserRole | undefined, departmentId?: number | null | undefined, isActive?: boolean | undefined);
}
