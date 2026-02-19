package apptemplate.application.ports.services;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;

public interface ExportService {

    <T> ExportResult exportToCsv(List<T> data, String fileName, Class<T> clazz);

    <T> ExportResult exportToExcel(List<T> data, String fileName, String sheetName, Class<T> clazz);

    <T> ExportResult exportToPdf(List<T> data, String fileName, String reportTitle, PdfReportOptions options, Class<T> clazz);

    record ExportResult(
            ByteArrayOutputStream outputStream,
            String contentType,
            String fileName
    ) {}

    record PdfReportOptions(
            String subtitle,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String generatedBy,
            boolean includePageNumbers,
            boolean includeTimestamp
    ) {
        public static PdfReportOptions defaults() {
            return new PdfReportOptions(null, null, null, null, true, true);
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private String subtitle;
            private LocalDateTime fromDate;
            private LocalDateTime toDate;
            private String generatedBy;
            private boolean includePageNumbers = true;
            private boolean includeTimestamp = true;

            public Builder subtitle(String subtitle) {
                this.subtitle = subtitle;
                return this;
            }

            public Builder fromDate(LocalDateTime fromDate) {
                this.fromDate = fromDate;
                return this;
            }

            public Builder toDate(LocalDateTime toDate) {
                this.toDate = toDate;
                return this;
            }

            public Builder generatedBy(String generatedBy) {
                this.generatedBy = generatedBy;
                return this;
            }

            public Builder includePageNumbers(boolean includePageNumbers) {
                this.includePageNumbers = includePageNumbers;
                return this;
            }

            public Builder includeTimestamp(boolean includeTimestamp) {
                this.includeTimestamp = includeTimestamp;
                return this;
            }

            public PdfReportOptions build() {
                return new PdfReportOptions(subtitle, fromDate, toDate, generatedBy, includePageNumbers, includeTimestamp);
            }
        }
    }
}
