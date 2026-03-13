import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Presentation
import { AuthController } from './presentation/auth.controller';

// Infrastructure
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Domain interfaces
import { IJwtTokenService } from './domain/interfaces/jwt-token.service.interface';
import { IPasswordService } from './domain/interfaces/password.service.interface';

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
  exports: [IPasswordService, IJwtTokenService, JwtModule],
})
export class AuthModule {}
