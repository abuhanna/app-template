import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { DepartmentsModule } from './features/departments/departments.module';
import { FilesModule } from './features/files/files.module';
import { HealthModule } from './features/health/health.module';
import { ExportModule } from './features/export/export.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { AuditLogsModule } from './features/audit-logs/audit-logs.module';
import { User } from './features/users/user.entity';
import { Department } from './features/departments/department.entity';
import { UploadedFile } from './features/files/uploaded-file.entity';
import { AuditLog } from './common/audit/audit-log.entity';
import { Notification } from './features/notifications/notification.entity';
import { RefreshToken } from './features/auth/refresh-token.entity';
import { AuditSubscriber } from './common/audit/audit.subscriber';
import { SeedService } from './common/seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    UsersModule,
    DepartmentsModule,
    FilesModule,
    HealthModule,
    ExportModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  providers: [AuditSubscriber, SeedService],
})
export class AppModule {}
