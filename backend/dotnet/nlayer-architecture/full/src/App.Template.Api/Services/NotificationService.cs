using App.Template.Api.Infrastructure.Hubs;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace App.Template.Api.Services;

public interface INotificationService
{
    Task NotifyUserAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null);
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(string userId, NotificationsQueryParams queryParams);
    Task<bool> MarkAsReadAsync(long id, string userId);
    Task MarkAllAsReadAsync(string userId);
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

        await _notificationRepository.AddAsync(notification);

        var dto = new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type.ToString(),
            ReferenceId = notification.ReferenceId,
            ReferenceType = notification.ReferenceType,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };

        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", dto);
    }

    public async Task<PagedResult<NotificationDto>> GetNotificationsAsync(string userId, NotificationsQueryParams queryParams)
    {
        var query = _notificationRepository.GetByUserIdQueryable(userId);

        if (queryParams.IsRead.HasValue)
            query = query.Where(n => n.IsRead == queryParams.IsRead.Value);

        if (queryParams.StartDate.HasValue)
            query = query.Where(n => n.CreatedAt >= queryParams.StartDate.Value);

        if (queryParams.EndDate.HasValue)
            query = query.Where(n => n.CreatedAt <= queryParams.EndDate.Value);

        query = query.OrderByDescending(n => n.CreatedAt);

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 20 : queryParams.PageSize;

        var dtoQuery = query.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString(),
            ReferenceId = n.ReferenceId,
            ReferenceType = n.ReferenceType,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });

        return await PagedResult<NotificationDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<bool> MarkAsReadAsync(long id, string userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(id, userId);
        if (notification == null) return false;

        notification.MarkAsRead();
        await _notificationRepository.UpdateAsync(notification);
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }
}
