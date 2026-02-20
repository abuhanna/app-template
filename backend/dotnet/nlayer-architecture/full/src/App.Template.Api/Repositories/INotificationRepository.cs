using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    IQueryable<Notification> GetByUserIdQueryable(string userId);
    Task<Notification?> GetByIdAsync(long id, string userId);
    Task UpdateAsync(Notification notification);
    Task MarkAllAsReadAsync(string userId);
}
