namespace App.Template.Api.Features.Export;

public interface IExportService
{
    Task<ExportResult> ExportToCsvAsync<T>(IEnumerable<T> data, string fileName, CancellationToken cancellationToken = default);
    Task<ExportResult> ExportToExcelAsync<T>(IEnumerable<T> data, string fileName, string sheetName = "Data", CancellationToken cancellationToken = default);
    Task<ExportResult> ExportToPdfAsync<T>(IEnumerable<T> data, string fileName, string reportTitle, PdfReportOptions? options = null, CancellationToken cancellationToken = default);
}

public record ExportResult(Stream FileStream, string ContentType, string FileName);

public class PdfReportOptions
{
    public string? Subtitle { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? GeneratedBy { get; set; }
    public bool IncludeTimestamp { get; set; } = true;
    public bool IncludePageNumbers { get; set; } = true;
}
