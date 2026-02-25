using App.Template.Api.Models.Enums;

namespace App.Template.Api.Services;

public interface INotificationService
{
    Task NotifyUserAsync(string userId, string title, string message, NotificationType type,
        string? referenceId = null, string? referenceType = null, CancellationToken ct = default);
}
