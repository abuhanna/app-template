package apptemplate.infrastructure.services;

import apptemplate.application.ports.services.ExportService;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExportServiceImpl implements ExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter FILE_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Override
    public <T> ExportResult exportToCsv(List<T> data, String fileName, Class<T> clazz) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {
            Field[] fields = clazz.getDeclaredFields();

            // Write headers
            String[] headers = new String[fields.length];
            for (int i = 0; i < fields.length; i++) {
                headers[i] = formatFieldName(fields[i].getName());
            }
            writer.writeNext(headers);

            // Write data rows
            for (T item : data) {
                String[] row = new String[fields.length];
                for (int i = 0; i < fields.length; i++) {
                    fields[i].setAccessible(true);
                    Object value = fields[i].get(item);
                    row[i] = formatValue(value);
                }
                writer.writeNext(row);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export CSV", e);
        }

        String generatedFileName = String.format("%s_%s.csv", fileName, LocalDateTime.now().format(FILE_DATE_FORMATTER));
        return new ExportResult(outputStream, "text/csv", generatedFileName);
    }

    @Override
    public <T> ExportResult exportToExcel(List<T> data, String fileName, String sheetName, Class<T> clazz) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);
            Field[] fields = clazz.getDeclaredFields();

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Create date style
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));

            // Write headers
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < fields.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(formatFieldName(fields[i].getName()));
                cell.setCellStyle(headerStyle);
            }

            // Write data rows
            int rowNum = 1;
            for (T item : data) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < fields.length; i++) {
                    fields[i].setAccessible(true);
                    Object value = fields[i].get(item);
                    org.apache.poi.ss.usermodel.Cell cell = row.createCell(i);

                    if (value instanceof LocalDateTime ldt) {
                        cell.setCellValue(ldt.format(DATE_FORMATTER));
                    } else if (value instanceof Boolean b) {
                        cell.setCellValue(b ? "Yes" : "No");
                    } else if (value instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                    } else {
                        cell.setCellValue(value != null ? value.toString() : "");
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < fields.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Add auto-filter
            if (!data.isEmpty()) {
                sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, data.size(), 0, fields.length - 1));
            }

            workbook.write(outputStream);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel", e);
        }

        String generatedFileName = String.format("%s_%s.xlsx", fileName, LocalDateTime.now().format(FILE_DATE_FORMATTER));
        return new ExportResult(outputStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", generatedFileName);
    }

    @Override
    public <T> ExportResult exportToPdf(List<T> data, String fileName, String reportTitle, PdfReportOptions options, Class<T> clazz) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(30, 30, 30, 30);

            Field[] fields = clazz.getDeclaredFields();

            // Header
            addHeader(document, reportTitle, options);

            // Data table
            Table table = new Table(UnitValue.createPercentArray(fields.length)).useAllAvailableWidth();

            // Table headers
            for (Field field : fields) {
                Cell headerCell = new Cell()
                        .add(new Paragraph(formatFieldName(field.getName())).setBold().setFontSize(8))
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setPadding(5);
                table.addHeaderCell(headerCell);
            }

            // Table data
            for (T item : data) {
                for (Field field : fields) {
                    field.setAccessible(true);
                    Object value = field.get(item);
                    Cell dataCell = new Cell()
                            .add(new Paragraph(formatValue(value)).setFontSize(8))
                            .setPadding(4);
                    table.addCell(dataCell);
                }
            }

            document.add(table);

            // Footer with record count
            document.add(new Paragraph(String.format("Total Records: %d", data.size()))
                    .setFontSize(9)
                    .setItalic()
                    .setMarginTop(10));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF", e);
        }

        String generatedFileName = String.format("%s_%s.pdf", fileName, LocalDateTime.now().format(FILE_DATE_FORMATTER));
        return new ExportResult(outputStream, "application/pdf", generatedFileName);
    }

    private void addHeader(Document document, String title, PdfReportOptions options) {
        // Title
        document.add(new Paragraph(title)
                .setFontSize(18)
                .setBold()
                .setFontColor(ColorConstants.DARK_GRAY));

        // Subtitle
        if (options.subtitle() != null && !options.subtitle().isEmpty()) {
            document.add(new Paragraph(options.subtitle())
                    .setFontSize(12)
                    .setFontColor(ColorConstants.GRAY));
        }

        // Metadata line
        List<String> metadata = new ArrayList<>();

        if (options.includeTimestamp()) {
            metadata.add("Generated: " + LocalDateTime.now().format(DATE_FORMATTER) + " UTC");
        }

        if (options.generatedBy() != null && !options.generatedBy().isEmpty()) {
            metadata.add("By: " + options.generatedBy());
        }

        if (options.fromDate() != null || options.toDate() != null) {
            String fromStr = options.fromDate() != null ? options.fromDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Start";
            String toStr = options.toDate() != null ? options.toDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Now";
            metadata.add("Period: " + fromStr + " - " + toStr);
        }

        if (!metadata.isEmpty()) {
            document.add(new Paragraph(String.join(" | ", metadata))
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.RIGHT));
        }

        // Separator line
        document.add(new Paragraph("").setMarginBottom(10));
    }

    private String formatFieldName(String name) {
        // Convert camelCase to Title Case with spaces
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < name.length(); i++) {
            char c = name.charAt(i);
            if (i > 0 && Character.isUpperCase(c)) {
                result.append(' ');
            }
            result.append(i == 0 ? Character.toUpperCase(c) : c);
        }
        return result.toString();
    }

    private String formatValue(Object value) {
        if (value == null) return "-";
        if (value instanceof LocalDateTime ldt) return ldt.format(DATE_FORMATTER);
        if (value instanceof Boolean b) return b ? "Yes" : "No";
        return value.toString();
    }
}
