using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// Data export endpoints for CSV, Excel, and PDF formats
/// </summary>
[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IExportService _exportService;
    private readonly ICurrentUserService _currentUserService;

    public ExportController(ISender mediator, IExportService exportService, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _exportService = exportService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Export audit logs to specified format
    /// </summary>
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
        var query = new GetAuditLogsQuery
        {
            EntityName = entityName,
            Action = action,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page,
            PageSize = Math.Min(pageSize, 10000) // Limit for export
        };
        var auditResult = await _mediator.Send(query, cancellationToken);

        var exportData = auditResult.Items.Select(a => new
        {
            a.Id,
            a.EntityName,
            a.EntityId,
            a.Action,
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
}
