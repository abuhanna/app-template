import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Presentation
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationsGateway } from './presentation/notifications.gateway';

// Infrastructure
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { WebSocketNotificationService } from './infrastructure/services/websocket-notification.service';

// Domain interfaces
import { INotificationRepository } from './domain/interfaces/notification.repository.interface';
import { INotificationService } from './domain/interfaces/notification.service.interface';

// Application
import {
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
} from './application/commands';
import { GetNotificationsHandler } from './application/queries';

const CommandHandlers = [MarkNotificationReadHandler, MarkAllNotificationsReadHandler];

const QueryHandlers = [GetNotificationsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([NotificationOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    // Gateway
    NotificationsGateway,
    // Repositories
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
    // Services
    {
      provide: INotificationService,
      useClass: WebSocketNotificationService,
    },
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [INotificationRepository, INotificationService],
})
export class NotificationModule {}
