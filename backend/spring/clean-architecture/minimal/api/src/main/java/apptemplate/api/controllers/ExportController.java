package apptemplate.api.controllers;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.ports.services.ExportService;
import apptemplate.application.ports.services.ExportService.ExportResult;
import apptemplate.application.ports.services.ExportService.PdfReportOptions;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import apptemplate.application.usecases.notification.GetUserNotificationsUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export endpoints for CSV, Excel, and PDF formats")
public class ExportController {

    private final ExportService exportService;
    private final GetAuditLogsUseCase getAuditLogsUseCase;
    private final GetUserNotificationsUseCase getUserNotificationsUseCase;
    private final CurrentUserService currentUserService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/audit-logs")
    @Operation(summary = "Export audit logs", description = "Export audit logs to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "1000") int limit
    ) {
        String sortBy = "createdAt";
        String sortOrder = "desc";

        var auditLogs = getAuditLogsUseCase.execute(
            search, entityName, entityId, null, action, fromDate, toDate,
            1, limit, sortBy, sortOrder
        );
        var exportData = auditLogs.getContent().stream()
                .map(this::toAuditLogExportDto)
                .collect(Collectors.toList());

        ExportResult result = switch (format.toLowerCase()) {
            case "csv" -> exportService.exportToCsv(exportData, "audit_logs", AuditLogExportDto.class);
            case "pdf" -> exportService.exportToPdf(exportData, "audit_logs", "Audit Log Report",
                    PdfReportOptions.builder()
                            .subtitle(String.format("Entity: %s, Action: %s",
                                    entityName != null ? entityName : "All",
                                    action != null ? action : "All"))
                            .fromDate(fromDate)
                            .toDate(toDate)
                            .generatedBy(currentUserService.getCurrentUsername().orElse("-"))
                            .build(),
                    AuditLogExportDto.class);
            default -> exportService.exportToExcel(exportData, "audit_logs", "Audit Logs", AuditLogExportDto.class);
        };

        return buildResponse(result);
    }

    @GetMapping("/notifications")
    @Operation(summary = "Export notifications", description = "Export notifications to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportNotifications(
            @RequestParam(defaultValue = "xlsx") String format
    ) {
        var notifications = getUserNotificationsUseCase.execute(false,
                PageRequest.of(0, 10000, Sort.by("createdAt").descending()));
        var exportData = notifications.getContent().stream()
                .map(this::toNotificationExportDto)
                .collect(Collectors.toList());

        ExportResult result = switch (format.toLowerCase()) {
            case "csv" -> exportService.exportToCsv(exportData, "notifications", NotificationExportDto.class);
            case "pdf" -> exportService.exportToPdf(exportData, "notifications", "Notifications Report",
                    PdfReportOptions.builder()
                            .generatedBy(currentUserService.getCurrentUsername().orElse("-"))
                            .build(),
                    NotificationExportDto.class);
            default -> exportService.exportToExcel(exportData, "notifications", "Notifications", NotificationExportDto.class);
        };

        return buildResponse(result);
    }

    private ResponseEntity<byte[]> buildResponse(ExportResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .body(result.outputStream().toByteArray());
    }

    private AuditLogExportDto toAuditLogExportDto(AuditLogDto log) {
        return new AuditLogExportDto(
                log.getId(),
                log.getEntityName(),
                log.getEntityId(),
                log.getAction(),
                log.getUserName() != null ? log.getUserName() : "-",
                log.getCreatedAt() != null ? log.getCreatedAt().format(DATE_FORMATTER) : "-",
                log.getDetails() != null ? log.getDetails() : "-"
        );
    }

    private NotificationExportDto toNotificationExportDto(NotificationDto n) {
        return new NotificationExportDto(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead() ? "Yes" : "No",
                n.getCreatedAt() != null ? n.getCreatedAt().format(DATE_FORMATTER) : "-"
        );
    }

    public record AuditLogExportDto(
            Long id,
            String entityType,
            String entityId,
            String action,
            String userName,
            String createdAt,
            String details
    ) {}

    public record NotificationExportDto(
            Long id,
            String title,
            String message,
            String type,
            String isRead,
            String createdAt
    ) {}
}
