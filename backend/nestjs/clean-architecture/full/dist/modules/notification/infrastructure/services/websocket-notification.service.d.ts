import { NotificationDto } from '../../application/dto/notification.dto';
import { INotificationService } from '../../domain/interfaces/notification.service.interface';
import { Notification } from '../../domain/entities/notification.entity';
export declare class WebSocketNotificationService implements INotificationService {
    private gateway;
    setGateway(gateway: {
        notifyUser: (userId: string, notification: NotificationDto) => void;
    }): void;
    sendToUser(userId: string, notification: Notification): Promise<void>;
}
