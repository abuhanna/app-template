import { ICommandHandler } from '@nestjs/cqrs';
import { RequestPasswordResetCommand } from './request-password-reset.command';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IEmailService } from '../../domain/interfaces/email.service.interface';
export declare class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
    private readonly userRepository;
    private readonly jwtTokenService;
    private readonly emailService;
    private readonly logger;
    constructor(userRepository: IUserRepository, jwtTokenService: IJwtTokenService, emailService: IEmailService);
    execute(command: RequestPasswordResetCommand): Promise<void>;
}
