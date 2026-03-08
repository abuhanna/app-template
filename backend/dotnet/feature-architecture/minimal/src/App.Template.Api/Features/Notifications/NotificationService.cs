using App.Template.Api.Common.Models;
using App.Template.Api.Data;

using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Notifications;

public interface INotificationService
{
    Task NotifyUserAsync(string userId, string title, string message, NotificationType type,
        string? referenceId = null, string? referenceType = null, CancellationToken cancellationToken = default);
    Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(string userId, int page, int pageSize,
        string? search = null, string? sortBy = null, string? sortOrder = null, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, string userId, CancellationToken cancellationToken = default);
}

public class NotificationDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext context,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task NotifyUserAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? referenceType = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new Notification(userId, title, message, type, referenceId, referenceType);

            await _context.Notifications.AddAsync(notification, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
            // Notifications are non-critical - swallow exception
        }
    }

    public async Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(
        string userId, int page, int pageSize,
        string? search = null, string? sortBy = null, string? sortOrder = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(n => n.Title.Contains(search) || n.Message.Contains(search));

        // Sorting
        query = (sortBy?.ToLower(), sortOrder?.ToLower()) switch
        {
            ("title", "asc") => query.OrderBy(n => n.Title),
            ("title", _) => query.OrderByDescending(n => n.Title),
            ("isread", "asc") => query.OrderBy(n => n.IsRead),
            ("isread", _) => query.OrderByDescending(n => n.IsRead),
            ("createdat", "asc") => query.OrderBy(n => n.CreatedAt),
            _ => query.OrderByDescending(n => n.CreatedAt)
        };

        var projected = query.Select(n => new NotificationDto
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

        return await PagedResult<NotificationDto>.CreateAsync(projected, page, pageSize, cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);
    }

    public async Task<bool> DeleteAsync(long id, string userId, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
