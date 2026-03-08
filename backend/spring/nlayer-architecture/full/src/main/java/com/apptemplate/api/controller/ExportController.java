package com.apptemplate.api.controller;

import com.apptemplate.api.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export endpoints for CSV, Excel, and PDF formats")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/users")
    @Operation(summary = "Export users", description = "Export users to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(defaultValue = "xlsx") String format) {
        ExportService.ExportResult result = exportService.exportUsers(format);
        return buildResponse(result);
    }

    @GetMapping("/departments")
    @Operation(summary = "Export departments", description = "Export departments to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportDepartments(
            @RequestParam(defaultValue = "xlsx") String format) {
        ExportService.ExportResult result = exportService.exportDepartments(format);
        return buildResponse(result);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Export audit logs", description = "Export audit logs to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestParam(defaultValue = "xlsx") String format) {
        ExportService.ExportResult result = exportService.exportAuditLogs(format);
        return buildResponse(result);
    }

    @GetMapping("/notifications")
    @Operation(summary = "Export notifications", description = "Export notifications to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportNotifications(
            @RequestParam(defaultValue = "xlsx") String format) {
        Long userId = getCurrentUserId();
        ExportService.ExportResult result = exportService.exportNotifications(format, userId);
        return buildResponse(result);
    }

    private ResponseEntity<byte[]> buildResponse(ExportService.ExportResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .body(result.outputStream().toByteArray());
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long) {
            return (Long) auth.getPrincipal();
        }
        return null;
    }
}
