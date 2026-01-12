import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationDto } from '../dto/notification.dto';
import { NotificationMapper } from '../mappers/notification.mapper';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetNotificationsQuery): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.findByUserId(query.userId);
    return NotificationMapper.toDtoList(notifications);
  }
}
