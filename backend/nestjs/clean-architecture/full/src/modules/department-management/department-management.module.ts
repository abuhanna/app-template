import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Presentation
import { DepartmentsController } from './presentation/departments.controller';

// Infrastructure
import { DepartmentOrmEntity } from './infrastructure/persistence/department.orm-entity';
import { DepartmentRepository } from './infrastructure/persistence/department.repository';

// Domain interfaces
import { IDepartmentRepository } from './domain/interfaces/department.repository.interface';

// Application
import {
  CreateDepartmentHandler,
  UpdateDepartmentHandler,
  DeleteDepartmentHandler,
} from './application/commands';
import { GetDepartmentsHandler, GetDepartmentByIdHandler } from './application/queries';

// Other modules
import { UserManagementModule } from '../user-management/user-management.module';

const CommandHandlers = [
  CreateDepartmentHandler,
  UpdateDepartmentHandler,
  DeleteDepartmentHandler,
];

const QueryHandlers = [GetDepartmentsHandler, GetDepartmentByIdHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([DepartmentOrmEntity]),
    forwardRef(() => UserManagementModule),
  ],
  controllers: [DepartmentsController],
  providers: [
    // Repositories
    {
      provide: IDepartmentRepository,
      useClass: DepartmentRepository,
    },
    // Command handlers
    ...CommandHandlers,
    // Query handlers
    ...QueryHandlers,
  ],
  exports: [IDepartmentRepository],
})
export class DepartmentManagementModule {}
