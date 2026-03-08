import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserContextInterceptor } from './core/interceptors/user-context.interceptor';
import { LoggerModule } from 'nestjs-pino';
import * as crypto from 'crypto';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FileManagementModule } from './modules/file-management/file-management.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { HealthModule } from './modules/health/health.module';
import { SeederModule } from './core/database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
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
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    CoreModule,
    SeederModule,
    HealthModule,
    AuthModule,
    NotificationModule,
    FileManagementModule,
    AuditLogModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserContextInterceptor,
    },
  ],
})
export class AppModule {}
