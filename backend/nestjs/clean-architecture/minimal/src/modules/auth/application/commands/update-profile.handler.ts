import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { UserInfoDto } from '../dto/user-info.dto';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  async execute(command: UpdateProfileCommand): Promise<UserInfoDto> {
    // Minimal variant uses external auth - profile updates are managed externally
    throw new BadRequestException(
      'Profile updates are managed by the external identity provider',
    );
  }
}
