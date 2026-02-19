package apptemplate.application.usecases.audit;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.mappers.AuditLogMapper;
import apptemplate.application.ports.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GetAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    // Map of allowed sort fields to actual entity field names
    private static final java.util.Map<String, String> SORT_FIELD_MAP = java.util.Map.of(
            "timestamp", "timestamp",
            "entityName", "entityName",
            "entityname", "entityName",
            "entityId", "entityId",
            "entityid", "entityId",
            "action", "action",
            "userId", "userId",
            "userid", "userId"
    );

    @Transactional(readOnly = true)
    public Page<AuditLogDto> execute(
            String search,
            String entityName,
            String entityId,
            Long userId,
            String action,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            int page,
            int pageSize,
            String sortBy,
            String sortDir) {

        // Convert 1-based page to 0-based for Spring Data
        int zeroBasedPage = page - 1;

        // Build sorting
        Sort sort = buildSort(sortBy, sortDir);

        // Create pageable
        Pageable pageable = PageRequest.of(zeroBasedPage, pageSize, sort);

        // Format search string with wildcards if present
        if (search != null && !search.isBlank()) {
            search = "%" + search + "%";
        } else {
            search = null;
        }

        return auditLogRepository.findByFilters(
            search, entityName, entityId, userId, action, fromDate, toDate, pageable
        ).map(auditLogMapper::toDto);
    }

    private Sort buildSort(String sortBy, String sortDir) {
        if (sortBy == null || sortBy.isBlank()) {
            // Default sort by timestamp descending
            return Sort.by(Sort.Direction.DESC, "timestamp");
        }

        // Map the sort field to actual entity field
        String actualField = SORT_FIELD_MAP.getOrDefault(sortBy.toLowerCase(), sortBy);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        return Sort.by(direction, actualField);
    }
}
