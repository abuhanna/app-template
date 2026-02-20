using App.Template.Api.Common.Entities;
using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.AuditLogs.Dtos;

namespace App.Template.Api.Features.AuditLogs;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogsQueryParams queryParams);
}

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;

    public AuditLogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogsQueryParams queryParams)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(queryParams.EntityName))
            query = query.Where(a => a.EntityName == queryParams.EntityName);

        if (!string.IsNullOrEmpty(queryParams.EntityId))
            query = query.Where(a => a.EntityId == queryParams.EntityId);

        if (!string.IsNullOrEmpty(queryParams.UserId))
            query = query.Where(a => a.UserId == queryParams.UserId);

        if (!string.IsNullOrEmpty(queryParams.Action) && Enum.TryParse<AuditAction>(queryParams.Action, true, out var action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var s = queryParams.Search.ToLower();
            query = query.Where(a =>
                a.EntityName.ToLower().Contains(s) ||
                a.EntityId.ToLower().Contains(s) ||
                (a.UserId != null && a.UserId.ToLower().Contains(s)));
        }

        if (queryParams.FromDate.HasValue)
            query = query.Where(a => a.Timestamp >= queryParams.FromDate.Value);

        if (queryParams.ToDate.HasValue)
            query = query.Where(a => a.Timestamp <= queryParams.ToDate.Value);

        query = query.OrderByDescending(a => a.Timestamp);

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 20 : queryParams.PageSize;

        var dtoQuery = query.Select(a => new AuditLogDto
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
        });

        return await PagedResult<AuditLogDto>.CreateAsync(dtoQuery, page, pageSize);
    }
}
