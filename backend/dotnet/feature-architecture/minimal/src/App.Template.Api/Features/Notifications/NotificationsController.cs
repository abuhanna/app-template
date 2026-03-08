using App.Template.Api.Common.Models;
using App.Template.Api.Common.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Notifications;

/// <summary>Notification management endpoints</summary>
[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(INotificationService notificationService, ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    /// <summary>Get current user's notifications with pagination</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "desc")
    {
        var userId = _currentUserService.UserId ?? "";

        var result = await _notificationService.GetUserNotificationsAsync(
            userId, page, pageSize, search, sortBy, sortOrder);

        return Ok(PaginatedResponse<NotificationDto>.From(result));
    }

    /// <summary>Get unread notification count</summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = _currentUserService.UserId ?? "";
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(ApiResponse.Ok(count, "Unread count retrieved successfully"));
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{id:long}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var userId = _currentUserService.UserId ?? "";
        // Use DbContext directly for mark-as-read (simple operation)
        var context = HttpContext.RequestServices.GetRequiredService<Data.AppDbContext>();
        var notification = await context.Notifications
            .Where(n => n.Id == id && n.UserId == userId)
            .FirstOrDefaultAsync();

        if (notification == null)
            return NotFound(ApiResponse.Fail($"Notification {id} not found"));

        notification.MarkAsRead();
        await context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = _currentUserService.UserId ?? "";
        var context = HttpContext.RequestServices.GetRequiredService<Data.AppDbContext>();
        var unread = await context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
            notification.MarkAsRead();

        await context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Delete a notification</summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = _currentUserService.UserId ?? "";
        var result = await _notificationService.DeleteAsync(id, userId);

        if (!result)
            return NotFound(ApiResponse.Fail($"Notification {id} not found"));

        return NoContent();
    }
}
