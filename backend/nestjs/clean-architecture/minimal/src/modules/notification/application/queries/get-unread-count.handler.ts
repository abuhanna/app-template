import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler implements IQueryHandler<GetUnreadCountQuery> {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetUnreadCountQuery): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnreadByUserId(query.userId);
    return { count };
  }
}
