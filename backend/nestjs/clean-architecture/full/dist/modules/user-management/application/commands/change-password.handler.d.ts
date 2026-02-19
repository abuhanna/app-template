import { ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IPasswordService } from '@/modules/auth/domain/interfaces/password.service.interface';
import { IRefreshTokenRepository } from '@/modules/auth/domain/interfaces/refresh-token.repository.interface';
export declare class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    private readonly userRepository;
    private readonly passwordService;
    private readonly refreshTokenRepository;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService, refreshTokenRepository: IRefreshTokenRepository);
    execute(command: ChangePasswordCommand): Promise<void>;
}
