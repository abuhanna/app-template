package apptemplate.application.ports.repositories;

import apptemplate.domain.entities.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

/**
 * Port interface for AuditLog repository operations.
 */
public interface AuditLogRepository {

    Page<AuditLog> findByFilters(
        String entityName,
        String entityId,
        Long userId,
        String action,
        LocalDateTime fromDate,
        LocalDateTime toDate,
        Pageable pageable
    );

    AuditLog save(AuditLog auditLog);
}
