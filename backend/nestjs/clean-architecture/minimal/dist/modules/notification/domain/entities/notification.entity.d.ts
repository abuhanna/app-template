import { NotificationType } from '../enums/notification-type.enum';
export interface CreateNotificationProps {
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    link?: string | null;
}
export declare class Notification {
    readonly id: number;
    readonly userId: number;
    title: string;
    message: string;
    type: NotificationType;
    link: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    private constructor();
    static create(props: CreateNotificationProps): Notification;
    static reconstitute(id: number, userId: number, title: string, message: string, type: NotificationType, link: string | null, isRead: boolean, readAt: Date | null, createdAt: Date): Notification;
    markAsRead(): void;
}
