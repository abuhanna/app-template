import { Repository } from 'typeorm';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
export declare class RefreshTokenRepository implements IRefreshTokenRepository {
    private readonly repository;
    constructor(repository: Repository<RefreshTokenOrmEntity>);
    findByToken(token: string): Promise<RefreshToken | null>;
    findByUserId(userId: number): Promise<RefreshToken[]>;
    save(refreshToken: RefreshToken): Promise<RefreshToken>;
    revokeByToken(token: string): Promise<void>;
    revokeAllByUserId(userId: number): Promise<void>;
    deleteExpired(): Promise<void>;
    private toDomain;
    private toEntity;
}
