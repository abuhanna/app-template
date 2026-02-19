import { Department } from '../../domain/entities/department.entity';
import { DepartmentDto } from '../dto/department.dto';
export declare class DepartmentMapper {
    static toDto(department: Department): DepartmentDto;
    static toDtoList(departments: Department[]): DepartmentDto[];
}
