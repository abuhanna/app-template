import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Presentation
import { AuthController } from './presentation/auth.controller';

// Infrastructure
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity';
import { RefreshTokenRepository } from './infrastructure/persistence/refresh-token.repository';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { EmailService } from './infrastructure/services/email.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Domain interfaces
import { IRefreshTokenRepository } from './domain/interfaces/refresh-token.repository.interface';
import { IJwtTokenService } from './domain/interfaces/jwt-token.service.interface';
import { IPasswordService } from './domain/interfaces/password.service.interface';
import { IEmailService } from './domain/interfaces/email.service.interface';

// Application
import {
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  UpdateProfileHandler,
} from './application/commands';
import { GetCurrentUserHandler, GetMyProfileHandler } from './application/queries';

// Other modules
import { UserManagementModule } from '../user-management/user-management.module';
import { DepartmentManagementModule } from '../department-management/department-management.module';

const CommandHandlers = [
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  UpdateProfileHandler,
];

const QueryHandlers = [GetCurrentUserHandler, GetMyProfileHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    forwardRef(() => UserManagementModule),
    forwardRef(() => DepartmentManagementModule),
  ],
  controllers: [AuthController],
  providers: [
    // Strategies
    JwtStrategy,
    // Repositories
    {
      provide: IRefreshTokenRepository,
      useClass: RefreshTokenRepository,
    },
    // Services
    {
      provide: IJwtTokenService,
      useClass: JwtTokenService,
    },
    {
      provide: IPasswordService,
      useClass: BcryptPasswordService,
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [IPasswordService, IJwtTokenService, IRefreshTokenRepository, JwtModule],
})
export class AuthModule {}
