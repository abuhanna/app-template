import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteDepartmentCommand } from './delete-department.command';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';

@CommandHandler(DeleteDepartmentCommand)
export class DeleteDepartmentHandler implements ICommandHandler<DeleteDepartmentCommand> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeleteDepartmentCommand): Promise<void> {
    const department = await this.departmentRepository.findById(command.id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department has users
    const userCount = await this.userRepository.countByDepartmentId(command.id);
    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete department. ${userCount} user(s) are assigned to this department.`,
      );
    }

    await this.departmentRepository.delete(command.id);
  }
}
