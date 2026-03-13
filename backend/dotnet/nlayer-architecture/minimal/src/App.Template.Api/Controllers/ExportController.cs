using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Repositories;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUserService _currentUserService;

    public ExportController(
        IExportService exportService,
        IAuditLogRepository auditLogRepository,
        INotificationRepository notificationRepository,
        ICurrentUserService currentUserService)
    {
        _exportService = exportService;
        _auditLogRepository = auditLogRepository;
        _notificationRepository = notificationRepository;
        _currentUserService = currentUserService;
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? entityType = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _auditLogRepository.GetPagedAsync(
            1, int.MaxValue,
            null, "desc",
            null, entityType,
            null, null,
            action, fromDate,
            toDate);
        return await ExportData(result.Items, format, "audit-logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications([FromQuery] string format = "xlsx")
    {
        var userId = _currentUserService.UserId ?? "";
        var result = await _notificationRepository.GetByUserIdPagedAsync(
            userId, 1, int.MaxValue);
        return await ExportData(result.Items.Select(n => new
        {
            n.Id,
            n.Title,
            n.Message,
            Type = n.Type.ToString().ToLower(),
            n.ReferenceId,
            n.ReferenceType,
            n.IsRead,
            n.CreatedAt
        }).ToList(), format, "notifications");
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
