import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import * as crypto from 'crypto';
import { AuthModule } from './features/auth/auth.module';
import { FilesModule } from './features/files/files.module';
import { HealthModule } from './features/health/health.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { AuditLogsModule } from './features/audit-logs/audit-logs.module';
import { UsersModule } from './features/users/users.module';
import { User } from './features/users/user.entity';
import { UploadedFile } from './features/files/uploaded-file.entity';
import { AuditLog } from './common/audit/audit-log.entity';
import { Notification } from './features/notifications/notification.entity';
import { RefreshToken } from './features/auth/refresh-token.entity';
import { AuditSubscriber } from './common/audit/audit.subscriber';
import { SeedService } from './common/seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || crypto.randomUUID();
          res.setHeader('X-Correlation-Id', correlationId);
          return correlationId;
        },
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        autoLogging: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'apptemplate',
      entities: [User, UploadedFile, AuditLog, Notification, RefreshToken],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    FilesModule,
    HealthModule,
    NotificationsModule,
    AuditLogsModule,
    UsersModule,
  ],
  providers: [AuditSubscriber, SeedService],
})
export class AppModule {}
