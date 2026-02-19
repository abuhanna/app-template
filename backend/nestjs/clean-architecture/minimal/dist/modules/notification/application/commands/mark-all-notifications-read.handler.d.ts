import { ICommandHandler } from '@nestjs/cqrs';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
export declare class MarkAllNotificationsReadHandler implements ICommandHandler<MarkAllNotificationsReadCommand> {
    private readonly notificationRepository;
    constructor(notificationRepository: INotificationRepository);
    execute(command: MarkAllNotificationsReadCommand): Promise<void>;
}
