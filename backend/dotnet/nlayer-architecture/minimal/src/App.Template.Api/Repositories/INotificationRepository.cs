using App.Template.Api.Models.Common;
using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface INotificationRepository
{
    Task<PagedResult<Notification>> GetByUserIdPagedAsync(string userId, int page, int pageSize, bool? unreadOnly = null, string? search = null, string? sortBy = null, string? sortOrder = null, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default);
    Task<bool> MarkAsReadAsync(long id, string userId, CancellationToken ct = default);
    Task<int> MarkAllAsReadAsync(string userId, CancellationToken ct = default);
    Task<bool> DeleteAsync(long id, string userId, CancellationToken ct = default);
}
