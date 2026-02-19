export interface CreateRefreshTokenProps {
    userId: number;
    token: string;
    expiresAt: Date;
    deviceInfo?: string | null;
    ipAddress?: string | null;
}
export declare class RefreshToken {
    readonly id: number;
    readonly userId: number;
    readonly token: string;
    readonly expiresAt: Date;
    deviceInfo: string | null;
    ipAddress: string | null;
    isRevoked: boolean;
    revokedAt: Date | null;
    replacedByToken: string | null;
    createdAt: Date;
    private constructor();
    static create(props: CreateRefreshTokenProps): RefreshToken;
    static reconstitute(id: number, userId: number, token: string, expiresAt: Date, deviceInfo: string | null, ipAddress: string | null, isRevoked: boolean, revokedAt: Date | null, replacedByToken: string | null, createdAt: Date): RefreshToken;
    revoke(replacedByToken?: string): void;
    isExpired(): boolean;
    isValid(): boolean;
}
