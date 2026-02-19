import { ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
export declare class LoginHandler implements ICommandHandler<LoginCommand> {
    private readonly userRepository;
    private readonly passwordService;
    private readonly jwtTokenService;
    private readonly refreshTokenRepository;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService, jwtTokenService: IJwtTokenService, refreshTokenRepository: IRefreshTokenRepository);
    execute(command: LoginCommand): Promise<LoginResponseDto>;
}
