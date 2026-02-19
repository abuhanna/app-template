package apptemplate.api.controllers;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.user.UserDto;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.ports.services.ExportService;
import apptemplate.application.ports.services.ExportService.ExportResult;
import apptemplate.application.ports.services.ExportService.PdfReportOptions;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import apptemplate.application.usecases.department.GetDepartmentsUseCase;
import apptemplate.application.usecases.user.GetUsersUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    private final GetUsersUseCase getUsersUseCase;
    private final GetDepartmentsUseCase getDepartmentsUseCase;
    private final GetAuditLogsUseCase getAuditLogsUseCase;
    private final CurrentUserService currentUserService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/users")
    @Operation(summary = "Export users", description = "Export users to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Boolean isActive
    ) {
        // Default sort
        String sortBy = "createdAt";
        String sortDir = "desc";

        var users = getUsersUseCase.execute(search, departmentId, isActive, 1, 10000, sortBy, sortDir);
        var exportData = users.getContent().stream()
                .map(this::toUserExportDto)
                .collect(Collectors.toList());

        ExportResult result = switch (format.toLowerCase()) {
            case "csv" -> exportService.exportToCsv(exportData, "users", UserExportDto.class);
            case "pdf" -> exportService.exportToPdf(exportData, "users", "Users Report",
                    PdfReportOptions.builder()
                            .subtitle(buildUserFilterDescription(search, departmentId, isActive))
                            .generatedBy(currentUserService.getCurrentUsername().orElse("-"))
                            .build(),
                    UserExportDto.class);
            default -> exportService.exportToExcel(exportData, "users", "Users", UserExportDto.class);
        };

        return buildResponse(result);
    }

    @GetMapping("/departments")
    @Operation(summary = "Export departments", description = "Export departments to CSV, Excel, or PDF format")
    public ResponseEntity<byte[]> exportDepartments(
            @RequestParam(defaultValue = "xlsx") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive
    ) {
        // Default sort
        String sortBy = "name";
        String sortDir = "asc";

        var departments = getDepartmentsUseCase.execute(search, isActive, 1, 10000, sortBy, sortDir);
        var exportData = departments.getContent().stream()
                .map(this::toDepartmentExportDto)
                .collect(Collectors.toList());

        ExportResult result = switch (format.toLowerCase()) {
            case "csv" -> exportService.exportToCsv(exportData, "departments", DepartmentExportDto.class);
            case "pdf" -> exportService.exportToPdf(exportData, "departments", "Departments Report",
                    PdfReportOptions.builder()
                            .generatedBy(currentUserService.getCurrentUsername().orElse("-"))
                            .build(),
                    DepartmentExportDto.class);
            default -> exportService.exportToExcel(exportData, "departments", "Departments", DepartmentExportDto.class);
        };

        return buildResponse(result);
    }

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
        // Default sort
        String sortBy = "timestamp";
        String sortDir = "desc";
        
        var auditLogs = getAuditLogsUseCase.execute(
            search, entityName, entityId, null, action, fromDate, toDate, 
            1, limit, sortBy, sortDir
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

    private ResponseEntity<byte[]> buildResponse(ExportResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .body(result.outputStream().toByteArray());
    }

    private String buildUserFilterDescription(String search, Long departmentId, Boolean isActive) {
        StringBuilder desc = new StringBuilder();
        if (isActive != null) {
            desc.append("Status: ").append(isActive ? "Active" : "Inactive");
        }
        if (departmentId != null) {
            if (!desc.isEmpty()) desc.append(" | ");
            desc.append("Department ID: ").append(departmentId);
        }
        if (search != null && !search.isEmpty()) {
            if (!desc.isEmpty()) desc.append(" | ");
            desc.append("Search: \"").append(search).append("\"");
        }
        return !desc.isEmpty() ? desc.toString() : "All Users";
    }

    private UserExportDto toUserExportDto(UserDto user) {
        return new UserExportDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getRole(),
                user.getDepartmentName(),
                user.isActive() ? "Yes" : "No",
                user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "-",
                user.getLastLoginAt() != null ? user.getLastLoginAt().format(DATE_FORMATTER) : "-"
        );
    }

    private DepartmentExportDto toDepartmentExportDto(DepartmentDto dept) {
        return new DepartmentExportDto(
                dept.getId(),
                dept.getCode(),
                dept.getName(),
                dept.getDescription(),
                dept.isActive() ? "Yes" : "No",
                dept.getCreatedAt() != null ? dept.getCreatedAt().format(DATE_FORMATTER) : "-"
        );
    }

    private AuditLogExportDto toAuditLogExportDto(AuditLogDto log) {
        return new AuditLogExportDto(
                log.getId(),
                log.getEntityName(),
                log.getEntityId(),
                log.getAction(),
                log.getUserId() != null ? log.getUserId().toString() : "-",
                log.getTimestamp() != null ? log.getTimestamp().format(DATE_FORMATTER) : "-",
                log.getAffectedColumns() != null ? log.getAffectedColumns() : "-"
        );
    }

    // Export DTOs with flattened fields for clean export
    public record UserExportDto(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            String fullName,
            String role,
            String departmentName,
            String isActive,
            String createdAt,
            String lastLoginAt
    ) {}

    public record DepartmentExportDto(
            Long id,
            String code,
            String name,
            String description,
            String isActive,
            String createdAt
    ) {}

    public record AuditLogExportDto(
            Long id,
            String entityName,
            String entityId,
            String action,
            String userId,
            String timestamp,
            String affectedColumns
    ) {}
}
