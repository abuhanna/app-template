import { Repository } from 'typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
export declare class NotificationRepository implements INotificationRepository {
    private readonly repository;
    constructor(repository: Repository<NotificationOrmEntity>);
    findById(id: number): Promise<Notification | null>;
    findByUserId(userId: number): Promise<Notification[]>;
    findUnreadByUserId(userId: number): Promise<Notification[]>;
    countUnreadByUserId(userId: number): Promise<number>;
    save(notification: Notification): Promise<Notification>;
    markAsRead(id: number): Promise<void>;
    markAllAsReadByUserId(userId: number): Promise<void>;
    private toDomain;
    private toEntity;
}
