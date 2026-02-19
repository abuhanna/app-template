export declare class UpdateDepartmentCommand {
    readonly id: number;
    readonly name?: string | undefined;
    readonly code?: string | undefined;
    readonly description?: string | null | undefined;
    readonly isActive?: boolean | undefined;
    constructor(id: number, name?: string | undefined, code?: string | undefined, description?: string | null | undefined, isActive?: boolean | undefined);
}
