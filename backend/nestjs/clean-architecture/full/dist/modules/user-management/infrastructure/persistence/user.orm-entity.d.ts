import { DepartmentOrmEntity } from '@/modules/department-management/infrastructure/persistence/department.orm-entity';
export declare class UserOrmEntity {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    departmentId: string | null;
    department?: DepartmentOrmEntity;
    isActive: boolean;
    lastLoginAt: Date | null;
    passwordResetToken: string | null;
    passwordResetTokenExpiresAt: Date | null;
    passwordHistory: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
}
