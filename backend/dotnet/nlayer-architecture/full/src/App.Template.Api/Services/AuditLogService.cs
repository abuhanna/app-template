using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Services;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogsQueryParams queryParams);
    Task<AuditLogDto?> GetByIdAsync(long id);
}

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogService(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogsQueryParams queryParams)
    {
        var query = _auditLogRepository.GetQueryable();

        if (!string.IsNullOrEmpty(queryParams.EntityType))
            query = query.Where(a => a.EntityName == queryParams.EntityType);

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

        query = (queryParams.SortBy?.ToLower(), queryParams.SortOrder.ToLower()) switch
        {
            ("action", "asc") => query.OrderBy(a => a.Action),
            ("action", _) => query.OrderByDescending(a => a.Action),
            ("entitytype", "asc") => query.OrderBy(a => a.EntityName),
            ("entitytype", _) => query.OrderByDescending(a => a.EntityName),
            ("createdat", "asc") => query.OrderBy(a => a.Timestamp),
            _ => query.OrderByDescending(a => a.Timestamp)
        };

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(a => new AuditLogDto
        {
            Id = a.Id,
            Action = a.Action.ToString().ToLower(),
            EntityType = a.EntityName,
            EntityId = a.EntityId,
            UserId = a.UserId,
            UserName = null,
            Details = a.OldValues != null || a.NewValues != null
                ? $"Old: {a.OldValues ?? "N/A"}, New: {a.NewValues ?? "N/A"}"
                : null,
            IpAddress = null,
            CreatedAt = a.Timestamp
        });

        return await PagedResult<AuditLogDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<AuditLogDto?> GetByIdAsync(long id)
    {
        var entity = await _auditLogRepository.GetQueryable()
            .Where(a => a.Id == id)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                Action = a.Action.ToString().ToLower(),
                EntityType = a.EntityName,
                EntityId = a.EntityId,
                UserId = a.UserId,
                UserName = null,
                Details = a.OldValues != null || a.NewValues != null
                    ? $"Old: {a.OldValues ?? "N/A"}, New: {a.NewValues ?? "N/A"}"
                    : null,
                IpAddress = null,
                CreatedAt = a.Timestamp
            })
            .FirstOrDefaultAsync();

        return entity;
    }
}
