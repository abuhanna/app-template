export declare class UserInfoDto {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    departmentId: number | null;
    departmentName?: string | null;
    constructor(partial: Partial<UserInfoDto>);
}
