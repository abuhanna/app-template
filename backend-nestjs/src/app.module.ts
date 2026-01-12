import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { DepartmentManagementModule } from './modules/department-management/department-management.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SeederModule } from './core/database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CoreModule,
    SeederModule,
    AuthModule,
    UserManagementModule,
    DepartmentManagementModule,
    NotificationModule,
  ],
})
export class AppModule {}
