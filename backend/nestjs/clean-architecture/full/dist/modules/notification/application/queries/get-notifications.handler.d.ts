import { IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationDto } from '../dto/notification.dto';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
export declare class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
    private readonly notificationRepository;
    constructor(notificationRepository: INotificationRepository);
    execute(query: GetNotificationsQuery): Promise<NotificationDto[]>;
}
