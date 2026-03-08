import { Module } from '@nestjs/common';
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
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Domain interfaces
import { IRefreshTokenRepository } from './domain/interfaces/refresh-token.repository.interface';
import { IJwtTokenService } from './domain/interfaces/jwt-token.service.interface';
import { IPasswordService } from './domain/interfaces/password.service.interface';

// User management (shared domain)
import { UserOrmEntity } from '../user-management/infrastructure/persistence/user.orm-entity';
import { UserRepository } from '../user-management/infrastructure/persistence/user.repository';
import { IUserRepository } from '../user-management/domain/interfaces/user.repository.interface';

// Application
import { ValidateTokenHandler } from './application/commands/validate-token.handler';
import { UpdateProfileHandler } from './application/commands/update-profile.handler';
import { GetMyProfileHandler } from './application/queries/get-my-profile.handler';

const CommandHandlers = [
  ValidateTokenHandler,
  UpdateProfileHandler,
];

const QueryHandlers = [GetMyProfileHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenOrmEntity, UserOrmEntity]),
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
    {
      provide: IUserRepository,
      useClass: UserRepository,
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
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [IPasswordService, IJwtTokenService, IRefreshTokenRepository, IUserRepository, JwtModule],
})
export class AuthModule {}
