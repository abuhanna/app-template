import { ICommandHandler } from '@nestjs/cqrs';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
export declare class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
    private readonly notificationRepository;
    constructor(notificationRepository: INotificationRepository);
    execute(command: MarkNotificationReadCommand): Promise<void>;
}
