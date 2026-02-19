package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Audit log endpoints (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogsController {

    private final GetAuditLogsUseCase getAuditLogsUseCase;

    @GetMapping
    @Operation(summary = "Get audit logs", description = "Get paginated list of audit logs with optional filters")
    public ResponseEntity<PagedResponse<AuditLogDto>> getAuditLogs(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "20") int pageSize,
            @Parameter(description = "Column to sort by (e.g., timestamp, entityName, action)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Search by entity name, entity ID, action, or username") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by entity name") @RequestParam(required = false) String entityName,
            @Parameter(description = "Filter by entity ID") @RequestParam(required = false) String entityId,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "Filter by action") @RequestParam(required = false) String action,
            @Parameter(description = "Filter from date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @Parameter(description = "Filter to date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate
    ) {
        // Ensure page is at least 1 and cap pageSize at 100
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<AuditLogDto> auditLogs = getAuditLogsUseCase.execute(
            search, entityName, entityId, userId, action, fromDate, toDate, page, pageSize, sortBy, sortDir
        );
        return ResponseEntity.ok(PagedResponse.from(auditLogs));
    }
}
