using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;
using AppTemplate.Application.Features.UserManagement.Queries.GetUsers;
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
    /// Export users to specified format
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportUsers(
        [FromQuery] string format = "xlsx",
        [FromQuery] bool? isActive = null,
        [FromQuery] long? departmentId = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetUsersQuery
        {
            Page = 1,
            PageSize = 10000, // Large page size for export
            IsActive = isActive,
            DepartmentId = departmentId,
            Search = search
        };
        var usersResult = await _mediator.Send(query, cancellationToken);

        var exportData = usersResult.Items.Select(u => new
        {
            u.Id,
            u.Username,
            u.Email,
            u.FirstName,
            u.LastName,
            u.FullName,
            u.Role,
            u.DepartmentName,
            IsActive = u.IsActive ? "Yes" : "No",
            CreatedAt = u.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            LastLoginAt = u.LastLoginAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "-"
        }).ToList();

        var exportResult = format.ToLower() switch
        {
            "csv" => await _exportService.ExportToCsvAsync(exportData, "users", cancellationToken),
            "pdf" => await _exportService.ExportToPdfAsync(exportData, "users", "Users Report", new PdfReportOptions
            {
                Subtitle = BuildFilterDescription(isActive, departmentId, search),
                GeneratedBy = _currentUserService.UserId ?? "System"
            }, cancellationToken),
            _ => await _exportService.ExportToExcelAsync(exportData, "users", "Users", cancellationToken)
        };

        return File(exportResult.FileStream, exportResult.ContentType, exportResult.FileName);
    }

    /// <summary>
    /// Export departments to specified format
    /// </summary>
    [HttpGet("departments")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportDepartments(
        [FromQuery] string format = "xlsx",
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetDepartmentsQuery
        {
            Page = 1,
            PageSize = 10000, // Large page size for export
            IsActive = isActive,
            Search = search
        };
        var deptResult = await _mediator.Send(query, cancellationToken);

        var exportData = deptResult.Items.Select(d => new
        {
            d.Id,
            d.Code,
            d.Name,
            d.Description,
            IsActive = d.IsActive ? "Yes" : "No",
            CreatedAt = d.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        }).ToList();

        var exportResult = format.ToLower() switch
        {
            "csv" => await _exportService.ExportToCsvAsync(exportData, "departments", cancellationToken),
            "pdf" => await _exportService.ExportToPdfAsync(exportData, "departments", "Departments Report", new PdfReportOptions
            {
                GeneratedBy = _currentUserService.UserId ?? "System"
            }, cancellationToken),
            _ => await _exportService.ExportToExcelAsync(exportData, "departments", "Departments", cancellationToken)
        };

        return File(exportResult.FileStream, exportResult.ContentType, exportResult.FileName);
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

    private static string BuildFilterDescription(bool? isActive, long? departmentId, string? search)
    {
        var filters = new List<string>();

        if (isActive.HasValue)
            filters.Add($"Status: {(isActive.Value ? "Active" : "Inactive")}");

        if (departmentId.HasValue)
            filters.Add($"Department ID: {departmentId.Value}");

        if (!string.IsNullOrWhiteSpace(search))
            filters.Add($"Search: \"{search}\"");

        return filters.Count > 0 ? string.Join(" | ", filters) : "All Users";
    }
}
