using App.Template.Api.Common.Services;
using App.Template.Api.Data;
using App.Template.Api.Features.AuditLogs.Dtos;
using App.Template.Api.Features.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Export;

[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly ICurrentUserService _currentUserService;
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public ExportController(
        IExportService exportService,
        ICurrentUserService currentUserService,
        AppDbContext context,
        INotificationService notificationService)
    {
        _exportService = exportService;
        _currentUserService = currentUserService;
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? entityType = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityName == entityType);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<Common.Entities.AuditAction>(action, true, out var auditAction))
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
                Action = a.Action.ToString(),
                UserId = a.UserId,
                UserName = a.UserName ?? a.UserId,
                Details = a.Details ?? a.NewValues ?? a.OldValues,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return await ExportData(data, format, "audit_logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications([FromQuery] string format = "xlsx")
    {
        var userId = _currentUserService.UserId ?? "";
        var result = await _notificationService.GetUserNotificationsAsync(userId, 1, 10000);

        return await ExportData(result.Items, format, "notifications");
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
