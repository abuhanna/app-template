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

    public async Task<List<Notification>> GetByUserIdAsync(string userId, int? limit = null, DateTime? startDate = null, DateTime? endDate = null, CancellationToken ct = default)
    {
        var query = _context.Notifications.Where(n => n.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(n => n.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(n => n.CreatedAt <= endDate.Value);

        query = query.OrderByDescending(n => n.CreatedAt);

        if (limit.HasValue)
            query = query.Take(limit.Value);

        return await query.ToListAsync(ct);
    }

    public async Task<bool> MarkAsReadAsync(long id, string userId, CancellationToken ct = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, ct);

        if (notification == null) return false;

        notification.MarkAsRead();
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var n in notifications)
            n.MarkAsRead();

        await _context.SaveChangesAsync(ct);
        return notifications.Count;
    }
}
