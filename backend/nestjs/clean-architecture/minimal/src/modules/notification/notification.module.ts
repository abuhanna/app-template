import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Presentation
import { NotificationsController } from './presentation/notifications.controller';

// Infrastructure
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';

// Domain interfaces
import { INotificationRepository } from './domain/interfaces/notification.repository.interface';

// Application
import {
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
  DeleteNotificationHandler,
} from './application/commands';
import { GetNotificationsHandler } from './application/queries';

const CommandHandlers = [MarkNotificationReadHandler, MarkAllNotificationsReadHandler, DeleteNotificationHandler];

const QueryHandlers = [GetNotificationsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([NotificationOrmEntity]),
  ],
  controllers: [NotificationsController],
  providers: [
    // Repositories
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [INotificationRepository],
})
export class NotificationModule {}
