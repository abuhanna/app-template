import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [NotificationGateway],
  controllers: [NotificationsController],
  exports: [NotificationGateway],
})
export class NotificationsModule {}
