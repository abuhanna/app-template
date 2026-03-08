package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.User;
import apptemplate.infrastructure.persistence.entities.UserJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserEntityMapper {

    @Mapping(source = "active", target = "isActive")
    UserJpaEntity toJpaEntity(User domain);

    User toDomain(UserJpaEntity jpaEntity);

    void updateJpaEntity(User domain, @MappingTarget UserJpaEntity jpaEntity);
}
