import { Notification } from '../entities/notification.entity';

export interface INotificationService {
  sendToUser(userId: string, notification: Notification): Promise<void>;
}

export const INotificationService = Symbol('INotificationService');
