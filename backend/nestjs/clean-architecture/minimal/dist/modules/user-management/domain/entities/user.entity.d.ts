import { UserRole } from '../value-objects/user-role';
export interface CreateUserProps {
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId?: number | null;
}
export interface UpdateUserProps {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    departmentId?: number | null;
    isActive?: boolean;
}
export declare class User {
    readonly id: number;
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId: number | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    passwordResetToken: string | null;
    passwordResetTokenExpiresAt: Date | null;
    passwordHistory: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: number | null;
    updatedBy: number | null;
    private constructor();
    static create(props: CreateUserProps): User;
    static reconstitute(id: number, email: string, username: string, passwordHash: string, firstName: string, lastName: string, role: UserRole, departmentId: number | null, isActive: boolean, lastLoginAt: Date | null, passwordResetToken: string | null, passwordResetTokenExpiresAt: Date | null, passwordHistory: string[], createdAt: Date, updatedAt: Date, createdBy: number | null, updatedBy: number | null): User;
    update(props: UpdateUserProps): void;
    updatePassword(passwordHash: string): void;
    isPasswordInHistory(passwordHash: string): boolean;
    recordLogin(): void;
    setPasswordResetToken(token: string, expiresInHours?: number): void;
    clearPasswordResetToken(): void;
    isPasswordResetTokenValid(token: string): boolean;
    get fullName(): string;
    isAdmin(): boolean;
}
