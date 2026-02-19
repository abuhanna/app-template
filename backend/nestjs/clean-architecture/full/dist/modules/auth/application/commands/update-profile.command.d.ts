export declare class UpdateProfileCommand {
    readonly userId: number;
    readonly firstName?: string | undefined;
    readonly lastName?: string | undefined;
    readonly email?: string | undefined;
    constructor(userId: number, firstName?: string | undefined, lastName?: string | undefined, email?: string | undefined);
}
