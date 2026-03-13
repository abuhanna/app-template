using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    IQueryable<Notification> GetByUserIdQueryable(long userId);
    Task<Notification?> GetByIdAsync(long id, long userId);
    Task UpdateAsync(Notification notification);
    Task MarkAllAsReadAsync(long userId);
    Task DeleteAsync(Notification notification);
}
