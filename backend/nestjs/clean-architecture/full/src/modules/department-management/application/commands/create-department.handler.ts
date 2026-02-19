import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateDepartmentCommand } from './create-department.command';
import { DepartmentDto } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { Department } from '../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';

@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(command: CreateDepartmentCommand): Promise<DepartmentDto> {
    // Check code uniqueness
    const existingCode = await this.departmentRepository.findByCode(command.code.toUpperCase());
    if (existingCode) {
      throw new ConflictException('Department code already in use');
    }

    // Create department
    const department = Department.create({
      name: command.name,
      code: command.code,
      description: command.description,
    });

    const savedDepartment = await this.departmentRepository.save(department);
    return DepartmentMapper.toDto(savedDepartment);
  }
}
