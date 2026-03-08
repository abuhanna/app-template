using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.Notifications.Dtos;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Notifications;

public interface INotificationService
{
    Task NotifyUserAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null);
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(string userId, NotificationsQueryParams queryParams);
    Task<bool> MarkAsReadAsync(long id, string userId);
    Task MarkAllAsReadAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> DeleteAsync(long id, string userId);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task NotifyUserAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ReferenceId = referenceId,
            ReferenceType = referenceType
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var dto = new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type.ToString().ToLower(),
            ReferenceId = notification.ReferenceId,
            ReferenceType = notification.ReferenceType,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };

        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", dto);
    }

    public async Task<PagedResult<NotificationDto>> GetNotificationsAsync(string userId, NotificationsQueryParams queryParams)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (queryParams.UnreadOnly.HasValue && queryParams.UnreadOnly.Value)
            query = query.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var s = queryParams.Search.ToLower();
            query = query.Where(n =>
                n.Title.ToLower().Contains(s) ||
                n.Message.ToLower().Contains(s));
        }

        query = (queryParams.SortBy?.ToLower(), queryParams.SortOrder?.ToLower()) switch
        {
            ("title", "asc") => query.OrderBy(n => n.Title),
            ("title", _) => query.OrderByDescending(n => n.Title),
            ("createdat", "asc") => query.OrderBy(n => n.CreatedAt),
            (_, "asc") => query.OrderBy(n => n.CreatedAt),
            _ => query.OrderByDescending(n => n.CreatedAt)
        };

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString().ToLower(),
            ReferenceId = n.ReferenceId,
            ReferenceType = n.ReferenceType,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });

        return await PagedResult<NotificationDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<bool> MarkAsReadAsync(long id, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification == null) return false;

        notification.MarkAsRead();
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task<bool> DeleteAsync(long id, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }
}
