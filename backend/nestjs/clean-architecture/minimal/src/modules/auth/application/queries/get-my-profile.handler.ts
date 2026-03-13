import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetMyProfileQuery } from './get-my-profile.query';
import { UserInfoDto } from '../dto/user-info.dto';
import { ClsService } from 'nestjs-cls';

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery> {
  constructor(private readonly cls: ClsService) {}

  async execute(query: GetMyProfileQuery): Promise<UserInfoDto> {
    // Minimal variant: profile comes from JWT claims stored in CLS
    const user = this.cls.get('user');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserInfoDto({
      id: String(user.sub),
      email: user.email,
      username: user.username,
      role: user.role,
    });
  }
}
