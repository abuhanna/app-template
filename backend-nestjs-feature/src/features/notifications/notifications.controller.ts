import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationGateway } from './notification.gateway';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @Get()
  getAll() {
    return []; // Return mock list
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return { success: true };
  }
}
