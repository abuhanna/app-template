using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using AppTemplate.Domain.Enums;
using AppTemplate.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IBpmDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IBpmDbContext context,
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new Notification(userId, title, message, type, referenceId, referenceType);

            await _context.Notifications.AddAsync(notification, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Broadcast to SignalR Hub
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.ReferenceId,
                notification.ReferenceType,
                notification.IsRead,
                notification.CreatedAt
            }, cancellationToken);

            _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
            // We swallow exception here to avoid breaking the main transaction flow
            // Notifications are considered non-critical for the main business transaction
        }
    }

    public async Task NotifyAdminAsync(
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? referenceType = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Get all active admin users
            var adminUserIds = await _context.Users
                .Where(u => u.Role == "Admin" && u.IsActive)
                .Select(u => u.Id.ToString())
                .ToListAsync(cancellationToken);

            if (adminUserIds.Count == 0)
            {
                _logger.LogWarning("No active admin users found to receive notification: {Title}", title);
                return;
            }

            // Notify each admin
            foreach (var adminUserId in adminUserIds)
            {
                await NotifyUserAsync(adminUserId, title, message, type, referenceId, referenceType, cancellationToken);
            }

            _logger.LogInformation("Admin notification sent to {Count} admin(s): {Title}", adminUserIds.Count, title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send admin notification: {Title}", title);
        }
    }
}
