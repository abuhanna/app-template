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
exports.MarkNotificationReadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_notification_read_command_1 = require("./mark-notification-read.command");
const notification_repository_interface_1 = require("../../domain/interfaces/notification.repository.interface");
let MarkNotificationReadHandler = class MarkNotificationReadHandler {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(command) {
        const notification = await this.notificationRepository.findById(command.notificationId);
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.userId !== command.userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        notification.markAsRead();
        await this.notificationRepository.save(notification);
    }
};
exports.MarkNotificationReadHandler = MarkNotificationReadHandler;
exports.MarkNotificationReadHandler = MarkNotificationReadHandler = __decorate([
    (0, cqrs_1.CommandHandler)(mark_notification_read_command_1.MarkNotificationReadCommand),
    __param(0, (0, common_1.Inject)(notification_repository_interface_1.INotificationRepository)),
    __metadata("design:paramtypes", [Object])
], MarkNotificationReadHandler);
//# sourceMappingURL=mark-notification-read.handler.js.map