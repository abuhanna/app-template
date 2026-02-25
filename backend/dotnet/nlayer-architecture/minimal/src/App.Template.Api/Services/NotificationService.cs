using App.Template.Api.Data;
using App.Template.Api.Infrastructure.Hubs;
using App.Template.Api.Models.Entities;
using App.Template.Api.Models.Enums;

using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext context,
        IHubContext<NotificationHub> hubContext,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyUserAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? referenceType = null,
        CancellationToken ct = default)
    {
        try
        {
            var notification = new Notification(userId, title, message, type, referenceId, referenceType);

            await _context.Notifications.AddAsync(notification, ct);
            await _context.SaveChangesAsync(ct);

            // Broadcast via SignalR
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                Type = notification.Type.ToString(),
                notification.ReferenceId,
                notification.ReferenceType,
                notification.IsRead,
                notification.CreatedAt
            }, ct);

            _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
            // Notifications are non-critical - swallow exception
        }
    }

}
