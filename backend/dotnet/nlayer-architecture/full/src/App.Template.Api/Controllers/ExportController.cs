using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
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
    private readonly IUserService _userService;
    private readonly IDepartmentService _departmentService;
    private readonly IAuditLogService _auditLogService;
    private readonly INotificationService _notificationService;

    public ExportController(
        IExportService exportService,
        IUserService userService,
        IDepartmentService departmentService,
        IAuditLogService auditLogService,
        INotificationService notificationService)
    {
        _exportService = exportService;
        _userService = userService;
        _departmentService = departmentService;
        _auditLogService = auditLogService;
        _notificationService = notificationService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> ExportUsers(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] long? departmentId = null)
    {
        var query = new UsersQueryParams { Page = 1, PageSize = int.MaxValue, Search = search, IsActive = isActive, DepartmentId = departmentId };
        var result = await _userService.GetUsersAsync(query);
        return await ExportData(result.Items, format, "users");
    }

    [HttpGet("departments")]
    public async Task<IActionResult> ExportDepartments(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        var query = new DeptQueryParams { Page = 1, PageSize = int.MaxValue, Search = search, IsActive = isActive };
        var result = await _departmentService.GetDepartmentsAsync(query);
        return await ExportData(result.Items, format, "departments");
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs(
        [FromQuery] string format = "xlsx",
        [FromQuery] string? entityType = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = new AuditLogsQueryParams { Page = 1, PageSize = int.MaxValue, EntityType = entityType, Action = action, FromDate = fromDate, ToDate = toDate };
        var result = await _auditLogService.GetAuditLogsAsync(query);
        return await ExportData(result.Items, format, "audit-logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications([FromQuery] string format = "xlsx")
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0";
        var userId = long.Parse(userIdStr);
        var query = new NotificationsQueryParams { Page = 1, PageSize = int.MaxValue };
        var result = await _notificationService.GetNotificationsAsync(userId, query);
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
