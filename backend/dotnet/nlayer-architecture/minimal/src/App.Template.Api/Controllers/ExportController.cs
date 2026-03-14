using App.Template.Api.Data;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly ICurrentUserService _currentUserService;
    private readonly AppDbContext _context;

    public ExportController(
        IExportService exportService,
        ICurrentUserService currentUserService,
        AppDbContext context)
    {
        _exportService = exportService;
        _currentUserService = currentUserService;
        _context = context;
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? entityType = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityName == entityType);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<AuditAction>(action, true, out var auditAction))
            query = query.Where(a => a.Action == auditAction);

        if (fromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.CreatedAt <= toDate.Value);

        var data = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(10000)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action.ToString().ToLower(),
                UserId = a.UserId,
                Details = a.OldValues != null || a.NewValues != null
                    ? $"Changed from {a.OldValues ?? "null"} to {a.NewValues ?? "null"}"
                    : null,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return await ExportData(data, format, "audit_logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications(
        [FromQuery] string format = "xlsx",
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId ?? "";

        var data = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10000)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                Type = n.Type.ToString().ToLower(),
                n.ReferenceId,
                n.ReferenceType,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return await ExportData(data, format, "notifications");
    }

    private async Task<IActionResult> ExportData<T>(IEnumerable<T> data, string format, string entityName)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        return format.ToLower() switch
        {
            "csv" => File(await _exportService.ExportToCsvAsync(data), "text/csv", $"{entityName}_{timestamp}.csv"),
            "pdf" => File(await _exportService.ExportToPdfAsync(data, $"{entityName} Export"), "application/pdf", $"{entityName}_{timestamp}.pdf"),
            _ => File(await _exportService.ExportToExcelAsync(data, entityName), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{entityName}_{timestamp}.xlsx")
        };
    }
}
