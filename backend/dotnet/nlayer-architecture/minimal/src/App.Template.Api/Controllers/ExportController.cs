using App.Template.Api.Data;
using App.Template.Api.Models.Entities;
using App.Template.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Controllers;

/// <summary>Data export endpoints for CSV, Excel, and PDF formats</summary>
[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IExportService _exportService;
    private readonly ICurrentUserService _currentUserService;

    public ExportController(AppDbContext context, IExportService exportService, ICurrentUserService currentUserService)
    {
        _context = context;
        _exportService = exportService;
        _currentUserService = currentUserService;
    }

    /// <summary>Export uploaded files to specified format (csv, xlsx, pdf)</summary>
    [HttpGet("files")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportFiles(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublic = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.UploadedFiles.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(f => f.Category == category);

        if (isPublic.HasValue)
            query = query.Where(f => f.IsPublic == isPublic.Value);

        var files = await query
            .OrderByDescending(f => f.CreatedAt)
            .Take(10000)
            .ToListAsync(cancellationToken);

        var exportData = files.Select(f => new
        {
            f.Id,
            f.OriginalFileName,
            f.ContentType,
            FileSizeKb = f.FileSize / 1024,
            f.Category,
            IsPublic = f.IsPublic ? "Yes" : "No",
            CreatedBy = f.CreatedBy ?? "-",
            CreatedAt = f.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            UpdatedAt = f.UpdatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "-"
        }).ToList();

        var filterDescription = BuildFilterDescription(category, isPublic);

        var exportResult = format.ToLower() switch
        {
            "csv" => await _exportService.ExportToCsvAsync(exportData, "files", cancellationToken),
            "pdf" => await _exportService.ExportToPdfAsync(exportData, "files", "Files Report", new PdfReportOptions
            {
                Subtitle = filterDescription,
                GeneratedBy = _currentUserService.UserId ?? "System"
            }, cancellationToken),
            _ => await _exportService.ExportToExcelAsync(exportData, "files", "Files", cancellationToken)
        };

        return File(exportResult.FileStream, exportResult.ContentType, exportResult.FileName);
    }

    /// <summary>Export audit logs to specified format (csv, xlsx, pdf)</summary>
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? entityName = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 1000,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityName))
            query = query.Where(a => a.EntityName == entityName);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<AuditAction>(action, true, out var auditAction))
            query = query.Where(a => a.Action == auditAction);

        if (fromDate.HasValue)
            query = query.Where(a => a.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.Timestamp <= toDate.Value);

        var auditLogs = await query
            .OrderByDescending(a => a.Timestamp)
            .Take(Math.Min(pageSize, 10000))
            .ToListAsync(cancellationToken);

        var exportData = auditLogs.Select(a => new
        {
            a.Id,
            a.EntityName,
            a.EntityId,
            Action = a.Action.ToString(),
            a.UserId,
            Timestamp = a.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"),
            AffectedColumns = a.AffectedColumns ?? "-"
        }).ToList();

        var exportResult = format.ToLower() switch
        {
            "csv" => await _exportService.ExportToCsvAsync(exportData, "audit_logs", cancellationToken),
            "pdf" => await _exportService.ExportToPdfAsync(exportData, "audit_logs", "Audit Log Report", new PdfReportOptions
            {
                Subtitle = $"Entity: {entityName ?? "All"}, Action: {action ?? "All"}",
                FromDate = fromDate,
                ToDate = toDate,
                GeneratedBy = _currentUserService.UserId ?? "System"
            }, cancellationToken),
            _ => await _exportService.ExportToExcelAsync(exportData, "audit_logs", "Audit Logs", cancellationToken)
        };

        return File(exportResult.FileStream, exportResult.ContentType, exportResult.FileName);
    }

    private static string BuildFilterDescription(string? category, bool? isPublic)
    {
        var filters = new List<string>();

        if (!string.IsNullOrWhiteSpace(category))
            filters.Add($"Category: \"{category}\"");

        if (isPublic.HasValue)
            filters.Add($"Visibility: {(isPublic.Value ? "Public" : "Private")}");

        return filters.Count > 0 ? string.Join(" | ", filters) : "All Files";
    }
}
