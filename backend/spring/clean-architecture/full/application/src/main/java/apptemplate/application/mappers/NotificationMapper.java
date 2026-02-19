package apptemplate.application.mappers;

import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.domain.entities.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    @Mapping(target = "type", expression = "java(notification.getType().name())")
    @Mapping(target = "isRead", source = "read")
    NotificationDto toDto(Notification notification);
}
