import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findById(id: number): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findByUserIdPaginated(
    userId: string,
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: Notification[]; total: number }>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  markAsRead(id: number): Promise<void>;
  markAllAsReadByUserId(userId: string): Promise<void>;
  delete(id: number): Promise<void>;
}

export const INotificationRepository = Symbol('INotificationRepository');
