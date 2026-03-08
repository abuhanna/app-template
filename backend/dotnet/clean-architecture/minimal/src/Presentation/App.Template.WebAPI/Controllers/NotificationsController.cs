using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.NotificationManagement.Commands.DeleteNotification;
using AppTemplate.Application.Features.NotificationManagement.Commands.MarkAllAsRead;
using AppTemplate.Application.Features.NotificationManagement.Commands.MarkAsRead;
using AppTemplate.Application.Features.NotificationManagement.Queries.GetNotifications;
using AppTemplate.Application.Features.NotificationManagement.Queries.GetUnreadCount;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get notifications with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var query = new GetNotificationsQuery
        {
            Page = Math.Max(1, page),
            PageSize = Math.Clamp(pageSize, 1, 100),
            SortBy = sortBy,
            SortOrder = sortOrder,
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(PaginatedResponse<NotificationDto>.From(result));
    }

    /// <summary>
    /// Get unread notifications count
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _mediator.Send(new GetUnreadCountQuery());
        return Ok(ApiResponse.Ok(count, "Unread count retrieved"));
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var result = await _mediator.Send(new MarkNotificationReadCommand(id));
        if (!result)
        {
            return NotFound(ApiResponse.Fail($"Notification with ID {id} not found"));
        }
        return NoContent();
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _mediator.Send(new MarkAllNotificationsReadCommand());
        return NoContent();
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNotification(long id)
    {
        var result = await _mediator.Send(new DeleteNotificationCommand(id));
        if (!result)
        {
            return NotFound(ApiResponse.Fail($"Notification with ID {id} not found"));
        }
        return NoContent();
    }
}
