using System.Security.Claims;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<NotificationDto>>> GetAll([FromQuery] NotificationsQueryParams queryParams)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _notificationService.GetNotificationsAsync(userId, queryParams);
        return Ok(PaginatedResponse<NotificationDto>.From(result, "Notifications retrieved successfully"));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<object>>> GetUnreadCount()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(ApiResponse.Ok<object>(new { count }, "Unread count retrieved"));
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _notificationService.MarkAsReadAsync(id, userId);
        if (!result) return NotFound(ApiResponse.Fail("Notification not found"));
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _notificationService.MarkAllAsReadAsync(userId);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _notificationService.DeleteAsync(id, userId);
        if (!result) return NotFound(ApiResponse.Fail("Notification not found"));
        return NoContent();
    }
}
