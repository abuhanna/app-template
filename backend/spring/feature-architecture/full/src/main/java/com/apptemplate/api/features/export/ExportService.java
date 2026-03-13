package com.apptemplate.api.features.export;

import com.apptemplate.api.common.audit.AuditLog;
import com.apptemplate.api.common.audit.AuditLogRepository;
import com.apptemplate.api.features.departments.Department;
import com.apptemplate.api.features.departments.DepartmentRepository;
import com.apptemplate.api.features.notifications.Notification;
import com.apptemplate.api.features.notifications.NotificationRepository;
import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public record ExportResult(ByteArrayOutputStream outputStream, String fileName, String contentType) {}

    // --- Users Export ---
    public ExportResult exportUsers(String format) {
        List<User> users = userRepository.findAll(Sort.by("createdAt").descending());
        return switch (format.toLowerCase()) {
            case "csv" -> exportUsersToCsv(users);
            case "pdf" -> exportUsersToPdf(users);
            default -> exportUsersToExcel(users);
        };
    }

    private ExportResult exportUsersToExcel(List<User> users) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");
            String[] headers = {"ID", "Username", "Email", "First Name", "Last Name", "Role", "Active", "Created At"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(safe(user.getUsername()));
                row.createCell(2).setCellValue(safe(user.getEmail()));
                row.createCell(3).setCellValue(safe(user.getFirstName()));
                row.createCell(4).setCellValue(safe(user.getLastName()));
                row.createCell(5).setCellValue(safe(user.getRole()));
                row.createCell(6).setCellValue(user.isActive() ? "Yes" : "No");
                row.createCell(7).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            workbook.write(out);
            return new ExportResult(out, "users.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export users to Excel", e);
        }
    }

    private ExportResult exportUsersToCsv(List<User> users) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {
            csvPrinter.printRecord("ID", "Username", "Email", "First Name", "Last Name", "Role", "Active", "Created At");
            for (User user : users) {
                csvPrinter.printRecord(user.getId(), safe(user.getUsername()), safe(user.getEmail()),
                        safe(user.getFirstName()), safe(user.getLastName()), safe(user.getRole()),
                        user.isActive() ? "Yes" : "No",
                        user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            csvPrinter.flush();
            return new ExportResult(out, "users.csv", "text/csv");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export users to CSV", e);
        }
    }

    private ExportResult exportUsersToPdf(List<User> users) {
        // Simple PDF generation using iText
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf,
                    com.itextpdf.kernel.geom.PageSize.A4.rotate());

            document.add(new com.itextpdf.layout.element.Paragraph("Users Report")
                    .setFontSize(18).setBold());

            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(8);
            String[] headers = {"ID", "Username", "Email", "First Name", "Last Name", "Role", "Active", "Created At"};
            for (String header : headers) {
                table.addHeaderCell(header);
            }
            for (User user : users) {
                table.addCell(String.valueOf(user.getId()));
                table.addCell(safe(user.getUsername()));
                table.addCell(safe(user.getEmail()));
                table.addCell(safe(user.getFirstName()));
                table.addCell(safe(user.getLastName()));
                table.addCell(safe(user.getRole()));
                table.addCell(user.isActive() ? "Yes" : "No");
                table.addCell(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            document.add(table);
            document.close();
            return new ExportResult(out, "users.pdf", "application/pdf");
        } catch (Exception e) {
            throw new RuntimeException("Failed to export users to PDF", e);
        }
    }

    // --- Departments Export ---
    public ExportResult exportDepartments(String format) {
        List<Department> departments = departmentRepository.findAll(Sort.by("name").ascending());
        return switch (format.toLowerCase()) {
            case "csv" -> exportDepartmentsToCsv(departments);
            case "pdf" -> exportDepartmentsToPdf(departments);
            default -> exportDepartmentsToExcel(departments);
        };
    }

    private ExportResult exportDepartmentsToExcel(List<Department> departments) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Departments");
            String[] headers = {"ID", "Code", "Name", "Description", "Active", "Created At"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (Department dept : departments) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dept.getId());
                row.createCell(1).setCellValue(safe(dept.getCode()));
                row.createCell(2).setCellValue(safe(dept.getName()));
                row.createCell(3).setCellValue(safe(dept.getDescription()));
                row.createCell(4).setCellValue(dept.isActive() ? "Yes" : "No");
                row.createCell(5).setCellValue(dept.getCreatedAt() != null ? dept.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            workbook.write(out);
            return new ExportResult(out, "departments.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export departments to Excel", e);
        }
    }

    private ExportResult exportDepartmentsToCsv(List<Department> departments) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {
            csvPrinter.printRecord("ID", "Code", "Name", "Description", "Active", "Created At");
            for (Department dept : departments) {
                csvPrinter.printRecord(dept.getId(), safe(dept.getCode()), safe(dept.getName()),
                        safe(dept.getDescription()), dept.isActive() ? "Yes" : "No",
                        dept.getCreatedAt() != null ? dept.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            csvPrinter.flush();
            return new ExportResult(out, "departments.csv", "text/csv");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export departments to CSV", e);
        }
    }

    private ExportResult exportDepartmentsToPdf(List<Department> departments) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf,
                    com.itextpdf.kernel.geom.PageSize.A4.rotate());

            document.add(new com.itextpdf.layout.element.Paragraph("Departments Report")
                    .setFontSize(18).setBold());

            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(6);
            String[] headers = {"ID", "Code", "Name", "Description", "Active", "Created At"};
            for (String header : headers) {
                table.addHeaderCell(header);
            }
            for (Department dept : departments) {
                table.addCell(String.valueOf(dept.getId()));
                table.addCell(safe(dept.getCode()));
                table.addCell(safe(dept.getName()));
                table.addCell(safe(dept.getDescription()));
                table.addCell(dept.isActive() ? "Yes" : "No");
                table.addCell(dept.getCreatedAt() != null ? dept.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            document.add(table);
            document.close();
            return new ExportResult(out, "departments.pdf", "application/pdf");
        } catch (Exception e) {
            throw new RuntimeException("Failed to export departments to PDF", e);
        }
    }

    // --- Audit Logs Export ---
    public ExportResult exportAuditLogs(String format) {
        List<AuditLog> auditLogs = auditLogRepository.findAll(Sort.by("createdAt").descending());
        return switch (format.toLowerCase()) {
            case "csv" -> exportAuditLogsToCsv(auditLogs);
            case "pdf" -> exportAuditLogsToPdf(auditLogs);
            default -> exportAuditLogsToExcel(auditLogs);
        };
    }

    private ExportResult exportAuditLogsToExcel(List<AuditLog> auditLogs) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Logs");
            String[] headers = {"ID", "Action", "Entity Type", "Entity ID", "User", "Details", "Created At"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (AuditLog log : auditLogs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(log.getId());
                row.createCell(1).setCellValue(safe(log.getAction()));
                row.createCell(2).setCellValue(safe(log.getEntityName()));
                row.createCell(3).setCellValue(safe(log.getEntityId()));
                row.createCell(4).setCellValue(safe(log.getUserName()));
                row.createCell(5).setCellValue(safe(log.getDetails()));
                row.createCell(6).setCellValue(log.getCreatedAt() != null ? log.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            workbook.write(out);
            return new ExportResult(out, "audit-logs.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export audit logs to Excel", e);
        }
    }

    private ExportResult exportAuditLogsToCsv(List<AuditLog> auditLogs) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {
            csvPrinter.printRecord("ID", "Action", "Entity Type", "Entity ID", "User", "Details", "Created At");
            for (AuditLog log : auditLogs) {
                csvPrinter.printRecord(log.getId(), safe(log.getAction()), safe(log.getEntityName()),
                        safe(log.getEntityId()), safe(log.getUserName()), safe(log.getDetails()),
                        log.getCreatedAt() != null ? log.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            csvPrinter.flush();
            return new ExportResult(out, "audit-logs.csv", "text/csv");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export audit logs to CSV", e);
        }
    }

    private ExportResult exportAuditLogsToPdf(List<AuditLog> auditLogs) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf,
                    com.itextpdf.kernel.geom.PageSize.A4.rotate());

            document.add(new com.itextpdf.layout.element.Paragraph("Audit Logs Report")
                    .setFontSize(18).setBold());

            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(7);
            String[] headers = {"ID", "Action", "Entity Type", "Entity ID", "User", "Details", "Created At"};
            for (String header : headers) {
                table.addHeaderCell(header);
            }
            for (AuditLog log : auditLogs) {
                table.addCell(String.valueOf(log.getId()));
                table.addCell(safe(log.getAction()));
                table.addCell(safe(log.getEntityName()));
                table.addCell(safe(log.getEntityId()));
                table.addCell(safe(log.getUserName()));
                table.addCell(safe(log.getDetails()));
                table.addCell(log.getCreatedAt() != null ? log.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            document.add(table);
            document.close();
            return new ExportResult(out, "audit-logs.pdf", "application/pdf");
        } catch (Exception e) {
            throw new RuntimeException("Failed to export audit logs to PDF", e);
        }
    }

    // --- Notifications Export ---
    public ExportResult exportNotifications(String format, Long userId) {
        List<Notification> notifications;
        if (userId != null) {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId,
                    PageRequest.of(0, 10000, Sort.by("createdAt").descending())).getContent();
        } else {
            notifications = notificationRepository.findAll(Sort.by("createdAt").descending());
        }
        return switch (format.toLowerCase()) {
            case "csv" -> exportNotificationsToCsv(notifications);
            case "pdf" -> exportNotificationsToPdf(notifications);
            default -> exportNotificationsToExcel(notifications);
        };
    }

    private ExportResult exportNotificationsToExcel(List<Notification> notifications) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Notifications");
            String[] headers = {"ID", "Title", "Message", "Type", "Read", "Created At"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (Notification n : notifications) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(n.getId());
                row.createCell(1).setCellValue(safe(n.getTitle()));
                row.createCell(2).setCellValue(safe(n.getMessage()));
                row.createCell(3).setCellValue(safe(n.getType()));
                row.createCell(4).setCellValue(n.isRead() ? "Yes" : "No");
                row.createCell(5).setCellValue(n.getCreatedAt() != null ? n.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            workbook.write(out);
            return new ExportResult(out, "notifications.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export notifications to Excel", e);
        }
    }

    private ExportResult exportNotificationsToCsv(List<Notification> notifications) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {
            csvPrinter.printRecord("ID", "Title", "Message", "Type", "Read", "Created At");
            for (Notification n : notifications) {
                csvPrinter.printRecord(n.getId(), safe(n.getTitle()), safe(n.getMessage()),
                        safe(n.getType()), n.isRead() ? "Yes" : "No",
                        n.getCreatedAt() != null ? n.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            csvPrinter.flush();
            return new ExportResult(out, "notifications.csv", "text/csv");
        } catch (IOException e) {
            throw new RuntimeException("Failed to export notifications to CSV", e);
        }
    }

    private ExportResult exportNotificationsToPdf(List<Notification> notifications) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(out);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf,
                    com.itextpdf.kernel.geom.PageSize.A4.rotate());

            document.add(new com.itextpdf.layout.element.Paragraph("Notifications Report")
                    .setFontSize(18).setBold());

            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(6);
            String[] headers = {"ID", "Title", "Message", "Type", "Read", "Created At"};
            for (String header : headers) {
                table.addHeaderCell(header);
            }
            for (Notification n : notifications) {
                table.addCell(String.valueOf(n.getId()));
                table.addCell(safe(n.getTitle()));
                table.addCell(safe(n.getMessage()));
                table.addCell(safe(n.getType()));
                table.addCell(n.isRead() ? "Yes" : "No");
                table.addCell(n.getCreatedAt() != null ? n.getCreatedAt().format(DATE_FORMATTER) : "");
            }
            document.add(table);
            document.close();
            return new ExportResult(out, "notifications.pdf", "application/pdf");
        } catch (Exception e) {
            throw new RuntimeException("Failed to export notifications to PDF", e);
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
