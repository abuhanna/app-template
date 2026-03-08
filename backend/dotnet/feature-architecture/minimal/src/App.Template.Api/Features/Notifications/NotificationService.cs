using App.Template.Api.Data;

using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Notifications;

public interface INotificationService
{
    Task NotifyUserAsync(string userId, string title, string message, NotificationType type,
        string? referenceId = null, string? referenceType = null, CancellationToken cancellationToken = default);
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

}
