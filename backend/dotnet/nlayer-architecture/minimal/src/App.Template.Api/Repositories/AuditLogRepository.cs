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
        string? sortBy, string sortDir,
        string? search, string? entityName,
        string? entityId, string? userId,
        string? action, DateTime? fromDate,
        DateTime? toDate, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(entityName))
            query = query.Where(a => a.EntityName == entityName);

        if (!string.IsNullOrEmpty(entityId))
            query = query.Where(a => a.EntityId == entityId);

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(a => a.UserId == userId);

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<AuditAction>(action, true, out var auditAction))
            query = query.Where(a => a.Action == auditAction);

        if (fromDate.HasValue)
            query = query.Where(a => a.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.Timestamp <= toDate.Value);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(a => a.EntityName.Contains(search) || a.EntityId.Contains(search));

        query = (sortBy?.ToLower(), sortDir?.ToLower()) switch
        {
            ("entityname", "asc") => query.OrderBy(a => a.EntityName),
            ("entityname", _) => query.OrderByDescending(a => a.EntityName),
            ("userid", "asc") => query.OrderBy(a => a.UserId),
            ("userid", _) => query.OrderByDescending(a => a.UserId),
            ("action", "asc") => query.OrderBy(a => a.Action),
            ("action", _) => query.OrderByDescending(a => a.Action),
            ("timestamp", "asc") => query.OrderBy(a => a.Timestamp),
            _ => query.OrderByDescending(a => a.Timestamp)
        };

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action.ToString(),
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                AffectedColumns = a.AffectedColumns,
                UserId = a.UserId,
                Timestamp = a.Timestamp
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
}
