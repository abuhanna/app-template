using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;
using App.Template.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

/// <summary>Notification management endpoints</summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(
        INotificationRepository notificationRepository,
        ICurrentUserService currentUserService)
    {
        _notificationRepository = notificationRepository;
        _currentUserService = currentUserService;
    }

    /// <summary>Get current user's notifications</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int? limit,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";

        var notifications = await _notificationRepository.GetByUserIdAsync(
            userId,
            limit.HasValue ? limit : (!startDate.HasValue && !endDate.HasValue ? 15 : null),
            startDate,
            endDate,
            cancellationToken);

        var result = notifications.Select(n => new
        {
            n.Id,
            n.Title,
            n.Message,
            Type = n.Type.ToString(),
            n.ReferenceId,
            n.ReferenceType,
            n.IsRead,
            n.CreatedAt
        });

        return Ok(result);
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{id:long}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(long id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        var found = await _notificationRepository.MarkAsReadAsync(id, userId, cancellationToken);

        if (!found)
            return NotFound(new { message = $"Notification {id} not found" });

        return NoContent();
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        await _notificationRepository.MarkAllAsReadAsync(userId, cancellationToken);
        return NoContent();
    }
}
