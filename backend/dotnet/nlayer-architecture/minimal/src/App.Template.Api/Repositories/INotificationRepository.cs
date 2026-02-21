using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface INotificationRepository
{
    Task<List<Notification>> GetByUserIdAsync(string userId, int? limit = null, DateTime? startDate = null, DateTime? endDate = null, CancellationToken ct = default);
    Task<bool> MarkAsReadAsync(long id, string userId, CancellationToken ct = default);
    Task<int> MarkAllAsReadAsync(string userId, CancellationToken ct = default);
}
