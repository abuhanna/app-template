import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationDto } from '../dto/notification.dto';
import { NotificationMapper } from '../mappers/notification.mapper';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
import { PagedResult, createPagedResult } from '@/common/types/paginated';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(query: GetNotificationsQuery): Promise<PagedResult<NotificationDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const { data, total } = await this.notificationRepository.findByUserIdPaginated(
      query.userId,
      page,
      pageSize,
      query.sortBy,
      query.sortOrder,
    );

    return createPagedResult(
      NotificationMapper.toDtoList(data),
      total,
      page,
      pageSize,
    );
  }
}
