import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAllByUser(
    userId: number,
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    unreadOnly?: boolean,
  ): Promise<PaginatedResult<any>> {
    const queryBuilder = this.notificationsRepository.createQueryBuilder('n');
    queryBuilder.andWhere('n.user_id = :userId', { userId });

    if (unreadOnly) {
      queryBuilder.andWhere('n.is_read = :isRead', { isRead: false });
    }

    const validSortFields = ['id', 'createdAt', 'type', 'isRead'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`n.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((item) => this.mapToResponse(item)),
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

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number, userId: number): Promise<void> {
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

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: number, userId: number): Promise<void> {
    const notification = await this.notificationsRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only access your own notifications');
    }
    await this.notificationsRepository.remove(notification);
  }

  private mapToResponse(n: Notification): any {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      referenceId: n.referenceId || null,
      referenceType: n.referenceType || null,
      isRead: n.isRead,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt?.toISOString(),
    };
  }
}
