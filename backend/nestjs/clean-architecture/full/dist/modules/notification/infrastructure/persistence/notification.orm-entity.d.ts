import { UserOrmEntity } from '@/modules/user-management/infrastructure/persistence/user.orm-entity';
export declare class NotificationOrmEntity {
    id: string;
    userId: string;
    user?: UserOrmEntity;
    title: string;
    message: string;
    type: string;
    link: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}
