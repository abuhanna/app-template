import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteNotificationCommand } from './delete-notification.command';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationHandler implements ICommandHandler<DeleteNotificationCommand> {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(command: DeleteNotificationCommand): Promise<void> {
    const notification = await this.notificationRepository.findById(command.notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== command.userId) {
      throw new ForbiddenException('You can only delete your own notifications');
    }

    await this.notificationRepository.delete(command.notificationId);
  }
}
