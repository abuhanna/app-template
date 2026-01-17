package apptemplate.infrastructure.persistence.adapters;

import apptemplate.application.ports.repositories.AuditLogRepository;
import apptemplate.domain.entities.AuditLog;
import apptemplate.infrastructure.persistence.entities.AuditLogJpaEntity;
import apptemplate.infrastructure.persistence.jpa.AuditLogJpaRepository;
import apptemplate.infrastructure.persistence.mappers.AuditLogEntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
@RequiredArgsConstructor
public class AuditLogRepositoryAdapter implements AuditLogRepository {

    private final AuditLogJpaRepository jpaRepository;
    private final AuditLogEntityMapper mapper;

    @Override
    public Page<AuditLog> findByFilters(
            String entityName,
            String entityId,
            Long userId,
            String action,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {
        return jpaRepository.findByFilters(entityName, entityId, userId, action, fromDate, toDate, pageable)
            .map(mapper::toDomain);
    }

    @Override
    public AuditLog save(AuditLog auditLog) {
        AuditLogJpaEntity entity = mapper.toEntity(auditLog);
        entity = jpaRepository.save(entity);
        return mapper.toDomain(entity);
    }
}
