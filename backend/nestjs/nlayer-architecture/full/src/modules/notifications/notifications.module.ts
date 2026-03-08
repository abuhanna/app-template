import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../../services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationGateway, NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationGateway, NotificationsService],
})
export class NotificationsModule {}
