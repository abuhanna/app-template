export declare class ChangePasswordCommand {
    readonly userId: number;
    readonly currentPassword: string;
    readonly newPassword: string;
    constructor(userId: number, currentPassword: string, newPassword: string);
}
