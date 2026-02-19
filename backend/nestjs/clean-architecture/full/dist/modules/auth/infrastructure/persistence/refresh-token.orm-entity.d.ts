import { UserOrmEntity } from '@/modules/user-management/infrastructure/persistence/user.orm-entity';
export declare class RefreshTokenOrmEntity {
    id: string;
    userId: string;
    user?: UserOrmEntity;
    token: string;
    expiresAt: Date;
    deviceInfo: string | null;
    ipAddress: string | null;
    isRevoked: boolean;
    revokedAt: Date | null;
    replacedByToken: string | null;
    createdAt: Date;
}
