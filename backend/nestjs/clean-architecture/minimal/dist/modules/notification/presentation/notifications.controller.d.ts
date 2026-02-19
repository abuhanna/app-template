import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { NotificationDto } from '../application/dto/notification.dto';
export declare class NotificationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findAll(user: CurrentUserPayload): Promise<NotificationDto[]>;
    markAsRead(user: CurrentUserPayload, id: number): Promise<{
        message: string;
    }>;
    markAllAsRead(user: CurrentUserPayload): Promise<{
        message: string;
    }>;
}
