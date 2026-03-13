package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.Notification;
import apptemplate.domain.enums.NotificationType;
import apptemplate.infrastructure.persistence.entities.NotificationJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface NotificationEntityMapper {

    @Mapping(target = "type", source = "type", qualifiedByName = "enumToString")
    NotificationJpaEntity toJpaEntity(Notification domain);

    @Mapping(target = "type", source = "type", qualifiedByName = "stringToEnum")
    Notification toDomain(NotificationJpaEntity jpaEntity);

    @Mapping(target = "type", source = "type", qualifiedByName = "enumToString")
    void updateJpaEntity(Notification domain, @MappingTarget NotificationJpaEntity jpaEntity);

    @Named("enumToString")
    default String enumToString(NotificationType type) {
        return type != null ? type.name().toLowerCase() : null;
    }

    @Named("stringToEnum")
    default NotificationType stringToEnum(String type) {
        if (type == null) return null;
        try {
            return NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NotificationType.INFO;
        }
    }
}
