using App.Template.Api.Common.Services;
using App.Template.Api.Features.AuditLogs.Dtos;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Data;
using App.Template.Api.Common.Models;
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
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public ExportController(
        IExportService exportService,
        AppDbContext context,
        INotificationService notificationService,
        ICurrentUserService currentUserService)
    {
        _exportService = exportService;
        _context = context;
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs([FromQuery] string format = "xlsx")
    {
        var auditLogs = await _context.AuditLogs
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

        return await ExportData(auditLogs, format, "audit-logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications([FromQuery] string format = "xlsx")
    {
        var userId = _currentUserService.UserId ?? "";
        var result = await _notificationService.GetUserNotificationsAsync(userId, 1, int.MaxValue);
        return await ExportData(result.Items, format, "notifications");
    }

    private async Task<IActionResult> ExportData<T>(List<T> data, string format, string entityName)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");

        return format.ToLower() switch
        {
            "csv" => File(
                await _exportService.ExportToCsvAsync(data),
                "text/csv",
                $"{entityName}_{timestamp}.csv"),
            "pdf" => File(
                await _exportService.ExportToPdfAsync(data, $"{entityName} Report"),
                "application/pdf",
                $"{entityName}_{timestamp}.pdf"),
            _ => File(
                await _exportService.ExportToExcelAsync(data, entityName),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{entityName}_{timestamp}.xlsx")
        };
    }
}
