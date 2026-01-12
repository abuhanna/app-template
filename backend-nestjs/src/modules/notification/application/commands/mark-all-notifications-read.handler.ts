import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler
  implements ICommandHandler<MarkAllNotificationsReadCommand>
{
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.notificationRepository.markAllAsReadByUserId(command.userId);
  }
}
