import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateDepartmentCommand } from './update-department.command';
import { DepartmentDto } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';

@CommandHandler(UpdateDepartmentCommand)
export class UpdateDepartmentHandler implements ICommandHandler<UpdateDepartmentCommand> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(command: UpdateDepartmentCommand): Promise<DepartmentDto> {
    const department = await this.departmentRepository.findById(command.id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check code uniqueness if updating
    if (command.code && command.code.toUpperCase() !== department.code) {
      const existingCode = await this.departmentRepository.findByCode(command.code.toUpperCase());
      if (existingCode) {
        throw new ConflictException('Department code already in use');
      }
    }

    // Update department
    department.update({
      name: command.name,
      code: command.code,
      description: command.description,
      isActive: command.isActive,
    });

    const savedDepartment = await this.departmentRepository.save(department);
    return DepartmentMapper.toDto(savedDepartment);
  }
}
