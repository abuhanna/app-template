package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.Notification;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NotificationEntityMapper {

    @Mapping(target = "user", ignore = true)
    NotificationJpaEntity toJpaEntity(Notification domain);

    Notification toDomain(NotificationJpaEntity jpaEntity);

    @Mapping(target = "user", ignore = true)
    void updateJpaEntity(Notification domain, @MappingTarget NotificationJpaEntity jpaEntity);
}
