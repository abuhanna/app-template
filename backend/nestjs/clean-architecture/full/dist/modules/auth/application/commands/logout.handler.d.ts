import { ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
export declare class LogoutHandler implements ICommandHandler<LogoutCommand> {
    private readonly refreshTokenRepository;
    constructor(refreshTokenRepository: IRefreshTokenRepository);
    execute(command: LogoutCommand): Promise<void>;
}
