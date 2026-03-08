using App.Template.Api.Models.Common;
using App.Template.Api.Repositories;
using App.Template.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

/// <summary>Notification management endpoints</summary>
[Authorize]
[ApiController]
[Route("api/notifications")]
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

    /// <summary>Get current user's notifications with pagination</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? unreadOnly = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "desc",
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId ?? "";

        var result = await _notificationRepository.GetByUserIdPagedAsync(
            userId, page, pageSize, unreadOnly, search, sortBy, sortOrder, cancellationToken);

        var dtoResult = new PagedResult<object>
        {
            Items = result.Items.Select(n => (object)new
            {
                n.Id,
                n.Title,
                n.Message,
                Type = n.Type.ToString().ToLower(),
                n.ReferenceId,
                n.ReferenceType,
                n.IsRead,
                n.CreatedAt
            }).ToList(),
            Pagination = result.Pagination
        };

        return Ok(new PaginatedResponse<object>
        {
            Success = true,
            Message = "Notifications retrieved successfully",
            Data = dtoResult.Items,
            Pagination = new PaginationInfo
            {
                Page = dtoResult.Pagination.Page,
                PageSize = dtoResult.Pagination.PageSize,
                TotalItems = dtoResult.Pagination.TotalItems,
                TotalPages = dtoResult.Pagination.TotalPages,
                HasNext = dtoResult.Pagination.HasNext,
                HasPrevious = dtoResult.Pagination.HasPrevious
            }
        });
    }

    /// <summary>Get unread notification count</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        var count = await _notificationRepository.GetUnreadCountAsync(userId, cancellationToken);
        return Ok(ApiResponse.Ok(new { count }, "Unread count retrieved successfully"));
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{id:long}/read")]
    public async Task<IActionResult> MarkAsRead(long id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        var found = await _notificationRepository.MarkAsReadAsync(id, userId, cancellationToken);

        if (!found)
            return NotFound(ApiResponse.Fail($"Notification {id} not found"));

        return NoContent();
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        await _notificationRepository.MarkAllAsReadAsync(userId, cancellationToken);
        return NoContent();
    }

    /// <summary>Delete a notification</summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? "";
        var deleted = await _notificationRepository.DeleteAsync(id, userId, cancellationToken);

        if (!deleted)
            return NotFound(ApiResponse.Fail($"Notification {id} not found"));

        return NoContent();
    }
}
