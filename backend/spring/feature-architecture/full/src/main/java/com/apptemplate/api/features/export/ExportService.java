package com.apptemplate.api.features.export;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Service
public class ExportService {

    public ByteArrayInputStream exportToCsv(List<Map<String, Object>> data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT)) {

            if (!data.isEmpty()) {
                csvPrinter.printRecord(data.get(0).keySet());
                for (Map<String, Object> record : data) {
                    csvPrinter.printRecord(record.values());
                }
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to CSV file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportToExcel(List<Map<String, Object>> data) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data");

            if (!data.isEmpty()) {
                // Header
                Row headerRow = sheet.createRow(0);
                int colIdx = 0;
                for (String key : data.get(0).keySet()) {
                    headerRow.createCell(colIdx++).setCellValue(key);
                }

                // Data
                int rowIdx = 1;
                for (Map<String, Object> record : data) {
                    Row row = sheet.createRow(rowIdx++);
                    colIdx = 0;
                    for (Object value : record.values()) {
                        row.createCell(colIdx++).setCellValue(value != null ? value.toString() : "");
                    }
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }
}
