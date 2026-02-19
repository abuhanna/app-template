"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_orm_entity_1 = require("./notification.orm-entity");
const notification_entity_1 = require("../../domain/entities/notification.entity");
let NotificationRepository = class NotificationRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: id.toString() } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByUserId(userId) {
        const entities = await this.repository.find({
            where: { userId: userId.toString() },
            order: { createdAt: 'DESC' },
        });
        return entities.map((entity) => this.toDomain(entity));
    }
    async findUnreadByUserId(userId) {
        const entities = await this.repository.find({
            where: { userId: userId.toString(), isRead: false },
            order: { createdAt: 'DESC' },
        });
        return entities.map((entity) => this.toDomain(entity));
    }
    async countUnreadByUserId(userId) {
        return this.repository.count({ where: { userId: userId.toString(), isRead: false } });
    }
    async save(notification) {
        const entity = this.toEntity(notification);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }
    async markAsRead(id) {
        await this.repository.update(id.toString(), { isRead: true, readAt: new Date() });
    }
    async markAllAsReadByUserId(userId) {
        await this.repository.update({ userId: userId.toString(), isRead: false }, { isRead: true, readAt: new Date() });
    }
    toDomain(entity) {
        return notification_entity_1.Notification.reconstitute(parseInt(entity.id, 10), parseInt(entity.userId, 10), entity.title, entity.message, entity.type, entity.link, entity.isRead, entity.readAt, entity.createdAt);
    }
    toEntity(notification) {
        const entity = new notification_orm_entity_1.NotificationOrmEntity();
        if (notification.id !== 0) {
            entity.id = notification.id.toString();
        }
        entity.userId = notification.userId.toString();
        entity.title = notification.title;
        entity.message = notification.message;
        entity.type = notification.type;
        entity.link = notification.link;
        entity.isRead = notification.isRead;
        entity.readAt = notification.readAt;
        entity.createdAt = notification.createdAt;
        return entity;
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_orm_entity_1.NotificationOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationRepository);
//# sourceMappingURL=notification.repository.js.map