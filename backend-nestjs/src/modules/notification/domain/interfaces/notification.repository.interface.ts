import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsReadByUserId(userId: string): Promise<void>;
}

export const INotificationRepository = Symbol('INotificationRepository');
