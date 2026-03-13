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

  async findByUserId(userId: string): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }

  async save(notification: Notification): Promise<Notification> {
    const entity = this.toEntity(notification);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async markAsRead(id: number): Promise<void> {
    await this.repository.update(id.toString(), { isRead: true, readAt: new Date() });
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id.toString());
  }

  private toDomain(entity: NotificationOrmEntity): Notification {
    return Notification.reconstitute(
      parseInt(entity.id, 10),
      entity.userId,
      entity.title,
      entity.message,
      entity.type as NotificationType,
      entity.referenceId,
      entity.referenceType,
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
    entity.userId = notification.userId;
    entity.title = notification.title;
    entity.message = notification.message;
    entity.type = notification.type;
    entity.referenceId = notification.referenceId;
    entity.referenceType = notification.referenceType;
    entity.isRead = notification.isRead;
    entity.readAt = notification.readAt;
    entity.createdAt = notification.createdAt;
    return entity;
  }
}
