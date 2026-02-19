export declare class UserDto {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    departmentId: number | null;
    departmentName?: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<UserDto>);
}
