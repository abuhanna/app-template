"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
const notification_dto_1 = require("../dto/notification.dto");
class NotificationMapper {
    static toDto(notification) {
        return new notification_dto_1.NotificationDto({
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.link,
            isRead: notification.isRead,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
        });
    }
    static toDtoList(notifications) {
        return notifications.map((notification) => NotificationMapper.toDto(notification));
    }
}
exports.NotificationMapper = NotificationMapper;
//# sourceMappingURL=notification.mapper.js.map