package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.AuditLog;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AuditLogEntityMapper {

    AuditLogEntityMapper INSTANCE = Mappers.getMapper(AuditLogEntityMapper.class);

    @Mapping(target = "action", expression = "java(entity.getAction() != null ? apptemplate.domain.entities.AuditLog.AuditAction.valueOf(entity.getAction()) : null)")
    AuditLog toDomain(AuditLogJpaEntity entity);

    @Mapping(target = "action", expression = "java(domain.getAction() != null ? domain.getAction().name() : null)")
    AuditLogJpaEntity toEntity(AuditLog domain);
}
