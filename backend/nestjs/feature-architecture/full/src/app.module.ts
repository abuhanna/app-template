import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { DepartmentsModule } from './features/departments/departments.module';
import { FilesModule } from './features/files/files.module';
import { User } from './features/users/user.entity';
import { Department } from './features/departments/department.entity';
import { UploadedFile } from './features/files/uploaded-file.entity';
import { AuditLog } from './features/audit/audit-log.entity';
import { AuthModule } from './features/auth/auth.module';
import { DepartmentsModule } from './features/departments/departments.module';
import { FilesModule } from './features/files/files.module';
import { HealthModule } from './features/health/health.module';
import { ExportModule } from './features/export/export.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { Department } from './features/departments/department.entity';
import { UploadedFile } from './features/files/uploaded-file.entity';
import { AuditLog } from './common/audit/audit-log.entity';
import { AuditSubscriber } from './common/audit/audit.subscriber';
import { UsersController } from './features/users/users.controller';
import { UserService } from './features/users/users.service';
import { UserRepository } from './features/users/users.repository';
import { AuditSubscriber } from './features/audit/audit.subscriber';

@Module({
  imports: [
    AuthModule,
    DepartmentsModule,
    FilesModule,
    HealthModule,
    ExportModule,
    NotificationsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'apptemplate',
      entities: [User, Department, UploadedFile, AuditLog],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User]),
    // Feature Modules
    UsersModule,
  ],
  controllers: [UsersController],
  providers: [UserService, UserRepository, AuditSubscriber],
})
export class AppModule {}
