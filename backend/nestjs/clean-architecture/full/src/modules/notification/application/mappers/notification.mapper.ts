import { Notification } from '../../domain/entities/notification.entity';
import { NotificationDto } from '../dto/notification.dto';

export class NotificationMapper {
  static toDto(notification: Notification): NotificationDto {
    return new NotificationDto({
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    });
  }

  static toDtoList(notifications: Notification[]): NotificationDto[] {
    return notifications.map((notification) => NotificationMapper.toDto(notification));
  }
}
