"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketNotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_mapper_1 = require("../../application/mappers/notification.mapper");
let WebSocketNotificationService = class WebSocketNotificationService {
    constructor() {
        this.gateway = null;
    }
    setGateway(gateway) {
        this.gateway = gateway;
    }
    async sendToUser(userId, notification) {
        if (this.gateway) {
            const dto = notification_mapper_1.NotificationMapper.toDto(notification);
            this.gateway.notifyUser(userId, dto);
        }
    }
};
exports.WebSocketNotificationService = WebSocketNotificationService;
exports.WebSocketNotificationService = WebSocketNotificationService = __decorate([
    (0, common_1.Injectable)()
], WebSocketNotificationService);
//# sourceMappingURL=websocket-notification.service.js.map