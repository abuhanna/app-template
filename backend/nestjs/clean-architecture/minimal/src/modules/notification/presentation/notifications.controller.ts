import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { PagedResult } from '@/common/types/paginated';
import { NotificationDto } from '../application/dto/notification.dto';
import {
  MarkNotificationReadCommand,
  MarkAllNotificationsReadCommand,
  DeleteNotificationCommand,
} from '../application/commands';
import { GetNotificationsQuery, GetUnreadCountQuery } from '../application/queries';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ResponseMessage('Notifications retrieved successfully')
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, type: [NotificationDto] })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<PagedResult<NotificationDto>> {
    return this.queryBus.execute(
      new GetNotificationsQuery(
        user.sub,
        page ? parseInt(page, 10) : 1,
        pageSize ? parseInt(pageSize, 10) : 10,
        sortBy,
        sortOrder as 'asc' | 'desc' | undefined,
      ),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload): Promise<{ count: number }> {
    return this.queryBus.execute(new GetUnreadCountQuery(user.sub));
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new MarkNotificationReadCommand(id, user.sub));
    return { message: 'Notification marked as read' };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload): Promise<{ message: string }> {
    await this.commandBus.execute(new MarkAllNotificationsReadCommand(user.sub));
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteNotificationCommand(id, user.sub));
  }
}
