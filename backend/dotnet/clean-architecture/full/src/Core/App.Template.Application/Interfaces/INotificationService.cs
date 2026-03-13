using AppTemplate.Domain.Enums;

namespace AppTemplate.Application.Interfaces;

public interface INotificationService
{
    Task NotifyUserAsync(long userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null, CancellationToken cancellationToken = default);
    Task NotifyAdminAsync(string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null, CancellationToken cancellationToken = default);
}
