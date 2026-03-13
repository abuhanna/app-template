import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCurrentUserQuery } from './get-current-user.query';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<UserInfoDto> {
    const user = await this.userRepository.findById(Number(query.userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserInfoDto({
      id: String(user.id),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId ? String(user.departmentId) : null,
      departmentName: null,
    });
  }
}
