import { RefreshToken } from '../entities/refresh-token.entity';
export interface IRefreshTokenRepository {
    findByToken(token: string): Promise<RefreshToken | null>;
    findByUserId(userId: number): Promise<RefreshToken[]>;
    save(refreshToken: RefreshToken): Promise<RefreshToken>;
    revokeByToken(token: string): Promise<void>;
    revokeAllByUserId(userId: number): Promise<void>;
    deleteExpired(): Promise<void>;
}
export declare const IRefreshTokenRepository: unique symbol;
