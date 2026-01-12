package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.RefreshToken;
import apptemplate.infrastructure.persistence.entities.RefreshTokenJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RefreshTokenEntityMapper {

    @Mapping(target = "user", ignore = true)
    RefreshTokenJpaEntity toJpaEntity(RefreshToken domain);

    RefreshToken toDomain(RefreshTokenJpaEntity jpaEntity);

    @Mapping(target = "user", ignore = true)
    void updateJpaEntity(RefreshToken domain, @MappingTarget RefreshTokenJpaEntity jpaEntity);
}
