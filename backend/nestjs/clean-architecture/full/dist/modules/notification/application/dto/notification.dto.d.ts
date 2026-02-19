import { NotificationType } from '../../domain/enums/notification-type.enum';
export declare class NotificationDto {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    link: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    constructor(partial: Partial<NotificationDto>);
}
