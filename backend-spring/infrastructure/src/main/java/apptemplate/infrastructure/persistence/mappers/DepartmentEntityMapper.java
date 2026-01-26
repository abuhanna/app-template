package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.Department;
import apptemplate.infrastructure.persistence.entities.DepartmentJpaEntity;
import org.mapstruct.Mapper;

import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DepartmentEntityMapper {

    DepartmentJpaEntity toJpaEntity(Department domain);

    Department toDomain(DepartmentJpaEntity jpaEntity);

    void updateJpaEntity(Department domain, @MappingTarget DepartmentJpaEntity jpaEntity);
}
