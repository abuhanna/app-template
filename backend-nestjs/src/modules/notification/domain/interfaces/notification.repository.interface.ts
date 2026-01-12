import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findById(id: number): Promise<Notification | null>;
  findByUserId(userId: number): Promise<Notification[]>;
  findUnreadByUserId(userId: number): Promise<Notification[]>;
  countUnreadByUserId(userId: number): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  markAsRead(id: number): Promise<void>;
  markAllAsReadByUserId(userId: number): Promise<void>;
}

export const INotificationRepository = Symbol('INotificationRepository');
