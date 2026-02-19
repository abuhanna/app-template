import { ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
export declare class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    private readonly userRepository;
    private readonly jwtTokenService;
    private readonly refreshTokenRepository;
    constructor(userRepository: IUserRepository, jwtTokenService: IJwtTokenService, refreshTokenRepository: IRefreshTokenRepository);
    execute(command: RefreshTokenCommand): Promise<LoginResponseDto>;
}
