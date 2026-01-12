import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Presentation
import { UsersController } from './presentation/users.controller';

// Infrastructure
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';

// Domain interfaces
import { IUserRepository } from './domain/interfaces/user.repository.interface';

// Application
import {
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  ChangePasswordHandler,
} from './application/commands';
import { GetUsersHandler, GetUserByIdHandler } from './application/queries';

// Other modules
import { AuthModule } from '../auth/auth.module';
import { DepartmentManagementModule } from '../department-management/department-management.module';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  ChangePasswordHandler,
];

const QueryHandlers = [GetUsersHandler, GetUserByIdHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => DepartmentManagementModule),
  ],
  controllers: [UsersController],
  providers: [
    // Repositories
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [IUserRepository],
})
export class UserManagementModule {}
