package com.apptemplate.api.controller;

import com.apptemplate.api.dto.PagedResult;
import com.apptemplate.api.model.AuditLog;
import com.apptemplate.api.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Audit log endpoints")
public class AuditLogsController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get audit logs", description = "Get paginated list of audit logs with optional filters")
    public ResponseEntity<PagedResult<AuditLog>> getAuditLogs(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "20") int pageSize,
            @Parameter(description = "Column to sort by") @RequestParam(required = false, defaultValue = "dateTime") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Search by table name, type, or user ID") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by table name") @RequestParam(required = false) String tableName,
            @Parameter(description = "Filter by action type") @RequestParam(required = false) String type,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) String userId,
            @Parameter(description = "Filter from date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @Parameter(description = "Filter to date (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate
    ) {
        page = Math.max(1, page);
        pageSize = Math.min(Math.max(1, pageSize), 100);

        Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);

        Page<AuditLog> auditLogs = auditLogRepository.findWithFilters(
                search, tableName, type, userId, fromDate, toDate, pageRequest
        );

        return ResponseEntity.ok(PagedResult.fromPage(auditLogs));
    }
}
