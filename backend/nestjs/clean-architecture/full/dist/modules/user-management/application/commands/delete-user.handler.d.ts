import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from './delete-user.command';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
export declare class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(command: DeleteUserCommand): Promise<void>;
}
