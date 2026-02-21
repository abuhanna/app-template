using App.Template.Api.Common.Services;
using App.Template.Api.Data;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Notifications;

/// <summary>Notification management endpoints</summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(AppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    /// <summary>Get current user's notifications</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] int? limit,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var userId = _currentUserService.UserId ?? "";

        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(n => n.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(n => n.CreatedAt <= endDate.Value);

        query = query.OrderByDescending(n => n.CreatedAt);

        if (limit.HasValue)
            query = query.Take(limit.Value);
        else if (!startDate.HasValue && !endDate.HasValue)
            query = query.Take(15); // Default limit

        var notifications = await query.Select(n => new
        {
            n.Id,
            n.Title,
            n.Message,
            Type = n.Type.ToString(),
            n.ReferenceId,
            n.ReferenceType,
            n.IsRead,
            n.CreatedAt
        }).ToListAsync();

        return Ok(notifications);
    }

    /// <summary>Mark a notification as read</summary>
    [HttpPut("{id:long}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var userId = _currentUserService.UserId ?? "";
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = $"Notification {id} not found" });

        notification.MarkAsRead();
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Mark all notifications as read</summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = _currentUserService.UserId ?? "";
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
            notification.MarkAsRead();

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
