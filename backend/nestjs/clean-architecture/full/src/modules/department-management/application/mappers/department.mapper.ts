import { Department } from '../../domain/entities/department.entity';
import { DepartmentDto } from '../dto/department.dto';

export class DepartmentMapper {
  static toDto(department: Department): DepartmentDto {
    return new DepartmentDto({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      isActive: department.isActive,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    });
  }

  static toDtoList(departments: Department[]): DepartmentDto[] {
    return departments.map((department) => DepartmentMapper.toDto(department));
  }
}
