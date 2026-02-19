import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    const notification = await this.notificationRepository.findById(command.notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Ensure user owns this notification
    if (notification.userId !== command.userId) {
      throw new ForbiddenException('Access denied');
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);
  }
}
