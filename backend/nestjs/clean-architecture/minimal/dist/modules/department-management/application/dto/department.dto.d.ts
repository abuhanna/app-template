export declare class DepartmentDto {
    id: number;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<DepartmentDto>);
}
