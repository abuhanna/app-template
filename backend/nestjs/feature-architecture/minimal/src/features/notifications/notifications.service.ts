import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(
    userId: string,
    query: PaginationQueryDto,
    unreadOnly?: string,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.notificationsRepository.createQueryBuilder('notification');

    qb.andWhere('notification.userId = :userId', { userId });

    if (unreadOnly === 'true') {
      qb.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    if (query.search) {
      qb.andWhere(
        '(notification.title ILIKE :search OR notification.message ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const validSortFields = ['id', 'title', 'type', 'isRead', 'createdAt'];
    const sortField = query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const direction = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`notification.${sortField}`, direction);

    const totalItems = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);
    const items = await qb.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map(n => this.mapToResponse(n)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: number, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only access your own notifications');
    }
    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: number, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only access your own notifications');
    }
    await this.notificationsRepository.remove(notification);
  }

  private mapToResponse(notification: Notification): any {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      referenceId: notification.referenceId || null,
      referenceType: notification.referenceType || null,
      isRead: notification.isRead,
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
