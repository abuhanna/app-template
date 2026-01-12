package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.User;
import apptemplate.infrastructure.persistence.entities.UserJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserEntityMapper {

    @Mapping(target = "department", ignore = true)
    UserJpaEntity toJpaEntity(User domain);

    User toDomain(UserJpaEntity jpaEntity);

    @Mapping(target = "department", ignore = true)
    void updateJpaEntity(User domain, @MappingTarget UserJpaEntity jpaEntity);
}
