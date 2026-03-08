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
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] int? limit,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetNotificationsQuery
        {
            UnreadOnly = unreadOnly,
            Limit = limit,
            StartDate = startDate,
            EndDate = endDate,
            Search = search,
            SortBy = sortBy,
            SortOrder = sortOrder,
            Page = page,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(PaginatedResponse<NotificationDto>.From(result));
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _mediator.Send(new GetUnreadCountQuery());
        return Ok(ApiResponse.Ok(count));
    }

    [HttpPut("{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _mediator.Send(new MarkNotificationReadCommand(id));
        return NoContent();
    }

    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _mediator.Send(new MarkAllNotificationsReadCommand());
        return NoContent();
    }

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
