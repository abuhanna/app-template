import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserOrmEntity } from '../../modules/user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../../modules/department-management/infrastructure/persistence/department.orm-entity';
import { NotificationOrmEntity } from '../../modules/notification/infrastructure/persistence/notification.orm-entity';
import { RefreshTokenOrmEntity } from '../../modules/auth/infrastructure/persistence/refresh-token.orm-entity';
import { UploadedFileOrmEntity } from '../../modules/file-management/infrastructure/persistence/uploaded-file.orm-entity';
import { AuditLogOrmEntity } from '../../modules/audit-log/infrastructure/persistence/audit-log.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'apptemplate_dev'),
        entities: [
          UserOrmEntity,
          DepartmentOrmEntity,
          NotificationOrmEntity,
          RefreshTokenOrmEntity,
          UploadedFileOrmEntity,
          AuditLogOrmEntity,
        ],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
