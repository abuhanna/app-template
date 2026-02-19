import { Notification } from '../entities/notification.entity';
export interface INotificationService {
    sendToUser(userId: string, notification: Notification): Promise<void>;
}
export declare const INotificationService: unique symbol;
