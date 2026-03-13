import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import * as crypto from 'crypto';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { ExportModule } from './modules/export/export.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { Department } from './entities/department.entity';
import { UploadedFile } from './entities/uploaded-file.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Notification } from './entities/notification.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { SeedService } from './services/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
    ]),
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
      entities: [User, Department, UploadedFile, AuditLog, Notification, RefreshToken],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: false,
      migrationsRun: true,
    }),
    TypeOrmModule.forFeature([User, Department]),
    AuthModule,
    DepartmentsModule,
    FilesModule,
    HealthModule,
    ExportModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UserService,
    UserRepository,
    AuditSubscriber,
    SeedService,
  ],
})
export class AppModule {}
