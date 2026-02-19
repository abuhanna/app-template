"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor(id, userId, title, message, type, link, isRead, readAt, createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.link = link;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }
    static create(props) {
        return new Notification(0, props.userId, props.title, props.message, props.type, props.link ?? null, false, null, new Date());
    }
    static reconstitute(id, userId, title, message, type, link, isRead, readAt, createdAt) {
        return new Notification(id, userId, title, message, type, link, isRead, readAt, createdAt);
    }
    markAsRead() {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = new Date();
        }
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.entity.js.map