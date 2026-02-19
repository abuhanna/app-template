export declare class LogoutCommand {
    readonly userId: number;
    readonly refreshToken?: string | undefined;
    constructor(userId: number, refreshToken?: string | undefined);
}
