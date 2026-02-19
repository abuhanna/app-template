import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationDto } from '../application/dto/notification.dto';
import { INotificationService } from '../domain/interfaces/notification.service.interface';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly notificationService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService, notificationService: INotificationService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    notifyUser(userId: string, notification: NotificationDto): void;
    isUserOnline(userId: string): boolean;
}
