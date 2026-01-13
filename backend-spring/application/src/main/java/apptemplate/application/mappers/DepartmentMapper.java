package apptemplate.application.mappers;

import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.domain.entities.Department;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    DepartmentMapper INSTANCE = Mappers.getMapper(DepartmentMapper.class);

    @Mapping(target = "isActive", source = "active")
    DepartmentDto toDto(Department department);
}
