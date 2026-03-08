import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetMyProfileQuery } from './get-my-profile.query';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetMyProfileQuery): Promise<UserInfoDto> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserInfoDto({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: null,
    });
  }
}
