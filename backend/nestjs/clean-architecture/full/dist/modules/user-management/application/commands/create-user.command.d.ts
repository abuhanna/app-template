import { UserRole } from '../../domain/value-objects/user-role';
export declare class CreateUserCommand {
    readonly email: string;
    readonly username: string;
    readonly password: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly role: UserRole;
    readonly departmentId?: number | undefined;
    constructor(email: string, username: string, password: string, firstName: string, lastName: string, role: UserRole, departmentId?: number | undefined);
}
