using App.Template.Api.Infrastructure.Hubs;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Services;

public interface INotificationService
{
    Task NotifyUserAsync(long userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null);
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(long userId, NotificationsQueryParams queryParams);
    Task<int> GetUnreadCountAsync(long userId);
    Task<bool> MarkAsReadAsync(long id, long userId);
    Task MarkAllAsReadAsync(long userId);
    Task<bool> DeleteAsync(long id, long userId);
}

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(INotificationRepository notificationRepository, IHubContext<NotificationHub> hubContext)
    {
        _notificationRepository = notificationRepository;
        _hubContext = hubContext;
    }

    public async Task NotifyUserAsync(long userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null)
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

        await _notificationRepository.AddAsync(notification);

        var dto = new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type.ToString().ToLower(),
            ReferenceId = notification.ReferenceId,
            ReferenceType = notification.ReferenceType,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            CreatedAt = notification.CreatedAt
        };

        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", dto);
    }

    public async Task<PagedResult<NotificationDto>> GetNotificationsAsync(long userId, NotificationsQueryParams queryParams)
    {
        var query = _notificationRepository.GetByUserIdQueryable(userId);

        if (queryParams.UnreadOnly == true)
            query = query.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var s = queryParams.Search.ToLower();
            query = query.Where(n =>
                n.Title.ToLower().Contains(s) ||
                n.Message.ToLower().Contains(s));
        }

        query = (queryParams.SortBy?.ToLower(), queryParams.SortOrder.ToLower()) switch
        {
            ("title", "asc") => query.OrderBy(n => n.Title),
            ("title", _) => query.OrderByDescending(n => n.Title),
            ("createdat", "asc") => query.OrderBy(n => n.CreatedAt),
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
            ReadAt = n.ReadAt,
            CreatedAt = n.CreatedAt
        });

        return await PagedResult<NotificationDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(long userId)
    {
        return await _notificationRepository.GetByUserIdQueryable(userId)
            .Where(n => !n.IsRead)
            .CountAsync();
    }

    public async Task<bool> MarkAsReadAsync(long id, long userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(id, userId);
        if (notification == null) return false;

        notification.MarkAsRead();
        await _notificationRepository.UpdateAsync(notification);
        return true;
    }

    public async Task MarkAllAsReadAsync(long userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }

    public async Task<bool> DeleteAsync(long id, long userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(id, userId);
        if (notification == null) return false;

        await _notificationRepository.DeleteAsync(notification);
        return true;
    }
}
