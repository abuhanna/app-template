package apptemplate.api.controllers;

import apptemplate.api.dto.ApiResponse;
import apptemplate.api.dto.PagedResponse;
import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AuditLogDto> auditLogs = getAuditLogsUseCase.execute(
            entityName, entityId, userId, action, fromDate, toDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.from(auditLogs)));
    }
}
