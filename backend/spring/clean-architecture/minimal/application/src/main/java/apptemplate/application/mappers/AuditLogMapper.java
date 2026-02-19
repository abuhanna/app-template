package apptemplate.application.mappers;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.domain.entities.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    @Mapping(target = "action", expression = "java(domain.getAction() != null ? domain.getAction().name() : null)")
    AuditLogDto toDto(AuditLog domain);
}
