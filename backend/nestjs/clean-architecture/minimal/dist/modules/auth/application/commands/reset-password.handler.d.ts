import { ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from './reset-password.command';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
export declare class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    private readonly userRepository;
    private readonly passwordService;
    private readonly refreshTokenRepository;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService, refreshTokenRepository: IRefreshTokenRepository);
    execute(command: ResetPasswordCommand): Promise<void>;
}
