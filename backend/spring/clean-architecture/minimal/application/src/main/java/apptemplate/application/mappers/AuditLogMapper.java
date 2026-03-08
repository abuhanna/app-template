package apptemplate.application.mappers;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.domain.entities.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    @Mapping(target = "action", expression = "java(domain.getAction() != null ? domain.getAction().name().toLowerCase() : null)")
    @Mapping(target = "entityType", source = "entityName")
    @Mapping(target = "createdAt", source = "timestamp")
    @Mapping(target = "userName", expression = "java(domain.getUserId() != null ? domain.getUserId().toString() : null)")
    @Mapping(target = "details", source = "newValues")
    @Mapping(target = "ipAddress", ignore = true)
    AuditLogDto toDto(AuditLog domain);
}
