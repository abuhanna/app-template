using App.Template.Api.Data;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;

using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _context;

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AuditLogDto>> GetPagedAsync(
        int page, int pageSize,
        string? sortBy, string sortOrder,
        string? search, string? entityType,
        string? entityId, string? userId,
        string? action, DateTime? fromDate,
        DateTime? toDate, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityName == entityType);

        if (!string.IsNullOrEmpty(entityId))
            query = query.Where(a => a.EntityId == entityId);

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(a => a.UserId == userId);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<AuditAction>(action, true, out var auditAction))
            query = query.Where(a => a.Action == auditAction);

        if (fromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.CreatedAt <= toDate.Value);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(a => a.EntityName.Contains(search) || a.EntityId.Contains(search));

        query = (sortBy?.ToLower(), sortOrder?.ToLower()) switch
        {
            ("entitytype", "asc") => query.OrderBy(a => a.EntityName),
            ("entitytype", _) => query.OrderByDescending(a => a.EntityName),
            ("userid", "asc") => query.OrderBy(a => a.UserId),
            ("userid", _) => query.OrderByDescending(a => a.UserId),
            ("action", "asc") => query.OrderBy(a => a.Action),
            ("action", _) => query.OrderByDescending(a => a.Action),
            ("createdat", "asc") => query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action.ToString().ToLower(),
                UserId = a.UserId,
                Details = a.OldValues != null || a.NewValues != null
                    ? $"Changed from {a.OldValues ?? "null"} to {a.NewValues ?? "null"}"
                    : null,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<AuditLogDto>
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

    public async Task<AuditLogDto?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var a = await _context.AuditLogs.FindAsync(new object[] { id }, ct);
        if (a == null) return null;

        return new AuditLogDto
        {
            Id = a.Id,
            EntityType = a.EntityName,
            EntityId = a.EntityId,
            Action = a.Action.ToString().ToLower(),
            UserId = a.UserId,
            Details = a.OldValues != null || a.NewValues != null
                ? $"Changed from {a.OldValues ?? "null"} to {a.NewValues ?? "null"}"
                : null,
            CreatedAt = a.CreatedAt
        };
    }
}
