package com.apptemplate.api.controller;

import com.apptemplate.api.dto.ApiResponse;
import com.apptemplate.api.dto.AuditLogDto;
import com.apptemplate.api.dto.PagedResult;
import com.apptemplate.api.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Audit log viewing endpoints")
public class AuditLogsController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get audit logs", description = "Get paginated list of audit logs with optional filters")
    public ResponseEntity<PagedResult<AuditLogDto>> getAuditLogs(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Column to sort by") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(defaultValue = "desc") String sortOrder,
            @Parameter(description = "Search term") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by entity type") @RequestParam(required = false) String entityType,
            @Parameter(description = "Filter by action") @RequestParam(required = false) String action,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) String userId,
            @Parameter(description = "Filter from date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @Parameter(description = "Filter to date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Page<AuditLogDto> auditLogs = auditLogService.getAuditLogs(
                search, entityType, action, userId, fromDate, toDate, page, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(PagedResult.from(auditLogs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit log by ID")
    public ResponseEntity<ApiResponse<AuditLogDto>> getAuditLogById(@PathVariable Long id) {
        AuditLogDto auditLog = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success(auditLog));
    }
}
