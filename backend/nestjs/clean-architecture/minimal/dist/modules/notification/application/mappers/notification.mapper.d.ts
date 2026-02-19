import { Notification } from '../../domain/entities/notification.entity';
import { NotificationDto } from '../dto/notification.dto';
export declare class NotificationMapper {
    static toDto(notification: Notification): NotificationDto;
    static toDtoList(notifications: Notification[]): NotificationDto[];
}
