export interface CreateDepartmentProps {
    name: string;
    code: string;
    description?: string | null;
}
export interface UpdateDepartmentProps {
    name?: string;
    code?: string;
    description?: string | null;
    isActive?: boolean;
}
export declare class Department {
    readonly id: number;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number | null;
    updatedBy: number | null;
    private constructor();
    static create(props: CreateDepartmentProps): Department;
    static reconstitute(id: number, name: string, code: string, description: string | null, isActive: boolean, createdAt: Date, updatedAt: Date, createdBy: number | null, updatedBy: number | null): Department;
    update(props: UpdateDepartmentProps): void;
    deactivate(): void;
    activate(): void;
}
