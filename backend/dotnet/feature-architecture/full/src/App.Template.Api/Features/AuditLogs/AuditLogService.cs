using App.Template.Api.Common.Entities;
using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.AuditLogs.Dtos;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.AuditLogs;

public interface IAuditLogService
{
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogsQueryParams queryParams);
    Task<AuditLogDto?> GetByIdAsync(long id);
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
            query = query.Where(a => a.CreatedAt >= queryParams.FromDate.Value);

        if (queryParams.ToDate.HasValue)
            query = query.Where(a => a.CreatedAt <= queryParams.ToDate.Value);

        query = (queryParams.SortBy?.ToLower(), queryParams.SortOrder?.ToLower()) switch
        {
            ("entitytype", "asc") => query.OrderBy(a => a.EntityName),
            ("entitytype", _) => query.OrderByDescending(a => a.EntityName),
            ("action", "asc") => query.OrderBy(a => a.Action),
            ("action", _) => query.OrderByDescending(a => a.Action),
            ("createdat", "asc") => query.OrderBy(a => a.CreatedAt),
            (_, "asc") => query.OrderBy(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(a => new AuditLogDto
        {
            Id = a.Id,
            EntityType = a.EntityName,
            EntityId = a.EntityId,
            Action = a.Action.ToString().ToLower(),
            UserId = a.UserId,
            UserName = a.UserName,
            Details = a.Details ?? (a.EntityName + " " + a.EntityId + " was " + a.Action.ToString().ToLower()),
            IpAddress = a.IpAddress,
            CreatedAt = a.CreatedAt
        });

        return await PagedResult<AuditLogDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<AuditLogDto?> GetByIdAsync(long id)
    {
        var log = await _context.AuditLogs.FirstOrDefaultAsync(a => a.Id == id);
        if (log == null) return null;

        return new AuditLogDto
        {
            Id = log.Id,
            EntityType = log.EntityName,
            EntityId = log.EntityId,
            Action = log.Action.ToString().ToLower(),
            UserId = log.UserId,
            UserName = log.UserName,
            Details = log.Details ?? (log.EntityName + " " + log.EntityId + " was " + log.Action.ToString().ToLower()),
            IpAddress = log.IpAddress,
            CreatedAt = log.CreatedAt
        };
    }
}
