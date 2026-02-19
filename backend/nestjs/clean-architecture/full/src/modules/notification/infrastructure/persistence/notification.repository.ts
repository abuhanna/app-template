import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/interfaces/notification.repository.interface';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repository: Repository<NotificationOrmEntity>,
  ) {}

  async findById(id: number): Promise<Notification | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: { userId: userId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: { userId: userId.toString(), isRead: false },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async countUnreadByUserId(userId: number): Promise<number> {
    return this.repository.count({ where: { userId: userId.toString(), isRead: false } });
  }

  async save(notification: Notification): Promise<Notification> {
    const entity = this.toEntity(notification);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async markAsRead(id: number): Promise<void> {
    await this.repository.update(id.toString(), { isRead: true, readAt: new Date() });
  }

  async markAllAsReadByUserId(userId: number): Promise<void> {
    await this.repository.update(
      { userId: userId.toString(), isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  private toDomain(entity: NotificationOrmEntity): Notification {
    return Notification.reconstitute(
      parseInt(entity.id, 10),
      parseInt(entity.userId, 10),
      entity.title,
      entity.message,
      entity.type as NotificationType,
      entity.link,
      entity.isRead,
      entity.readAt,
      entity.createdAt,
    );
  }

  private toEntity(notification: Notification): NotificationOrmEntity {
    const entity = new NotificationOrmEntity();
    if (notification.id !== 0) {
      entity.id = notification.id.toString();
    }
    entity.userId = notification.userId.toString();
    entity.title = notification.title;
    entity.message = notification.message;
    entity.type = notification.type;
    entity.link = notification.link;
    entity.isRead = notification.isRead;
    entity.readAt = notification.readAt;
    entity.createdAt = notification.createdAt;
    return entity;
  }
}
