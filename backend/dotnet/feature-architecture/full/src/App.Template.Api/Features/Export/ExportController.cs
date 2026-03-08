using App.Template.Api.Common.Services;
using App.Template.Api.Features.AuditLogs;
using App.Template.Api.Features.AuditLogs.Dtos;
using App.Template.Api.Features.Departments;
using App.Template.Api.Features.Departments.Dtos;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Notifications.Dtos;
using App.Template.Api.Features.Users;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Export;

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
    public async Task<IActionResult> ExportUsers([FromQuery] string format = "xlsx")
    {
        var result = await _userService.GetUsersAsync(new UsersQueryParams { PageSize = int.MaxValue });
        return await ExportData(result.Items, format, "users");
    }

    [HttpGet("departments")]
    public async Task<IActionResult> ExportDepartments([FromQuery] string format = "xlsx")
    {
        var result = await _departmentService.GetDepartmentsAsync(new DeptQueryParams { PageSize = int.MaxValue });
        return await ExportData(result.Items, format, "departments");
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> ExportAuditLogs([FromQuery] string format = "xlsx")
    {
        var result = await _auditLogService.GetAuditLogsAsync(new AuditLogsQueryParams { PageSize = int.MaxValue });
        return await ExportData(result.Items, format, "audit-logs");
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> ExportNotifications([FromQuery] string format = "xlsx")
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";
        var result = await _notificationService.GetNotificationsAsync(userId, new NotificationsQueryParams { PageSize = int.MaxValue });
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
