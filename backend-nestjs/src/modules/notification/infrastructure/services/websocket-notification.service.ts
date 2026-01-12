import { Injectable } from '@nestjs/common';
import { NotificationDto } from '../../application/dto/notification.dto';
import { INotificationService } from '../../domain/interfaces/notification.service.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationMapper } from '../../application/mappers/notification.mapper';

@Injectable()
export class WebSocketNotificationService implements INotificationService {
  private gateway: { notifyUser: (userId: string, notification: NotificationDto) => void } | null =
    null;

  setGateway(gateway: { notifyUser: (userId: string, notification: NotificationDto) => void }) {
    this.gateway = gateway;
  }

  async sendToUser(userId: string, notification: Notification): Promise<void> {
    if (this.gateway) {
      const dto = NotificationMapper.toDto(notification);
      this.gateway.notifyUser(userId, dto);
    }
  }
}
