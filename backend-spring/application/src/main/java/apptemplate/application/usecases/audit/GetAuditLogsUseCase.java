package apptemplate.application.usecases.audit;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.mappers.AuditLogMapper;
import apptemplate.application.ports.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GetAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Transactional(readOnly = true)
    public Page<AuditLogDto> execute(
            String entityName,
            String entityId,
            Long userId,
            String action,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {
        return auditLogRepository.findByFilters(
            entityName, entityId, userId, action, fromDate, toDate, pageable
        ).map(auditLogMapper::toDto);
    }
}
