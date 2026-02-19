export declare class CreateDepartmentCommand {
    readonly name: string;
    readonly code: string;
    readonly description?: string | undefined;
    constructor(name: string, code: string, description?: string | undefined);
}
