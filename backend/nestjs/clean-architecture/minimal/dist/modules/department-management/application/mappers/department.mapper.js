"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentMapper = void 0;
const department_dto_1 = require("../dto/department.dto");
class DepartmentMapper {
    static toDto(department) {
        return new department_dto_1.DepartmentDto({
            id: department.id,
            name: department.name,
            code: department.code,
            description: department.description,
            isActive: department.isActive,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
        });
    }
    static toDtoList(departments) {
        return departments.map((department) => DepartmentMapper.toDto(department));
    }
}
exports.DepartmentMapper = DepartmentMapper;
//# sourceMappingURL=department.mapper.js.map