using App.Template.Api.Data;
using App.Template.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public IQueryable<Notification> GetByUserIdQueryable(string userId)
        => _context.Notifications.Where(n => n.UserId == userId);

    public async Task<Notification?> GetByIdAsync(long id, string userId)
        => await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

    public async Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }
}
