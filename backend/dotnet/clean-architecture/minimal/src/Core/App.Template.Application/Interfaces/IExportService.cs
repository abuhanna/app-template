namespace AppTemplate.Application.Interfaces;

public interface IExportService
{
    Task<ExportResult> ExportToCsvAsync<T>(IEnumerable<T> data, string fileName, CancellationToken cancellationToken = default);
    Task<ExportResult> ExportToExcelAsync<T>(IEnumerable<T> data, string fileName, string sheetName = "Data", CancellationToken cancellationToken = default);
    Task<ExportResult> ExportToPdfAsync<T>(IEnumerable<T> data, string fileName, string reportTitle, PdfReportOptions? options = null, CancellationToken cancellationToken = default);
}

public record ExportResult(
    Stream FileStream,
    string ContentType,
    string FileName
);

public record PdfReportOptions
{
    public string? Subtitle { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public string? GeneratedBy { get; init; }
    public bool IncludePageNumbers { get; init; } = true;
    public bool IncludeTimestamp { get; init; } = true;
}
