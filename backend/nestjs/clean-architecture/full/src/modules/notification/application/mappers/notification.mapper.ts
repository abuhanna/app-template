import { Notification } from '../../domain/entities/notification.entity';
import { NotificationDto } from '../dto/notification.dto';

export class NotificationMapper {
  static toDto(notification: Notification): NotificationDto {
    return new NotificationDto({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
  }

  static toDtoList(notifications: Notification[]): NotificationDto[] {
    return notifications.map((notification) => NotificationMapper.toDto(notification));
  }
}
