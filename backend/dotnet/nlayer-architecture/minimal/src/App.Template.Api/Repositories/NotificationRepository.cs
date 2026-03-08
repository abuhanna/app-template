using App.Template.Api.Data;
using App.Template.Api.Models.Common;
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

    public async Task<PagedResult<Notification>> GetByUserIdPagedAsync(string userId, int page, int pageSize, bool? unreadOnly = null, string? search = null, string? sortBy = null, string? sortOrder = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Notifications.Where(n => n.UserId == userId);

        if (unreadOnly == true)
            query = query.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(n => n.Title.Contains(search) || n.Message.Contains(search));

        query = (sortBy?.ToLower(), sortOrder?.ToLower()) switch
        {
            ("title", "asc") => query.OrderBy(n => n.Title),
            ("title", _) => query.OrderByDescending(n => n.Title),
            ("createdat", "asc") => query.OrderBy(n => n.CreatedAt),
            _ => query.OrderByDescending(n => n.CreatedAt)
        };

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Notification>
        {
            Items = items,
            Pagination = new PaginationMeta
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                HasNext = page * pageSize < totalItems,
                HasPrevious = page > 1
            }
        };
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync(ct);
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

    public async Task<bool> DeleteAsync(long id, string userId, CancellationToken ct = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, ct);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
