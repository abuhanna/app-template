import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forFeature([User]),
    AuthModule,
    DepartmentsModule,
    FilesModule,
    HealthModule,
    ExportModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [UsersController],
  providers: [UserService, UserRepository, AuditSubscriber, SeedService],
})
export class AppModule {}
