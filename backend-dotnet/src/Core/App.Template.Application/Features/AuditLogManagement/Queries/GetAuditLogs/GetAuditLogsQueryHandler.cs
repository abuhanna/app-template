using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;

/// <summary>
/// Handler for GetAuditLogsQuery
/// </summary>
public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetAuditLogsQueryHandler> _logger;

    public GetAuditLogsQueryHandler(
        IApplicationDbContext context,
        ILogger<GetAuditLogsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching audit logs from database with pagination");

        var query = _context.AuditLogs.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(request.EntityName))
        {
            query = query.Where(a => a.EntityName == request.EntityName);
        }

        if (!string.IsNullOrEmpty(request.EntityId))
        {
            query = query.Where(a => a.EntityId == request.EntityId);
        }

        if (!string.IsNullOrEmpty(request.UserId))
        {
            query = query.Where(a => a.UserId == request.UserId);
        }

        if (!string.IsNullOrEmpty(request.Action))
        {
            query = query.Where(a => a.Action.ToString() == request.Action);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= request.ToDate.Value);
        }

        // Apply search across multiple fields
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(a =>
                a.EntityName.ToLower().Contains(search) ||
                a.EntityId.ToLower().Contains(search) ||
                (a.UserId != null && a.UserId.ToLower().Contains(search)));
        }

        // Get total count before pagination
        var totalItems = await query.CountAsync(cancellationToken);

        // Apply sorting
        var isDescending = request.SortDir?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? true;
        query = request.SortBy?.ToLower() switch
        {
            "entityname" => isDescending ? query.OrderByDescending(a => a.EntityName) : query.OrderBy(a => a.EntityName),
            "entityid" => isDescending ? query.OrderByDescending(a => a.EntityId) : query.OrderBy(a => a.EntityId),
            "action" => isDescending ? query.OrderByDescending(a => a.Action) : query.OrderBy(a => a.Action),
            "userid" => isDescending ? query.OrderByDescending(a => a.UserId) : query.OrderBy(a => a.UserId),
            "timestamp" => isDescending ? query.OrderByDescending(a => a.Timestamp) : query.OrderBy(a => a.Timestamp),
            _ => query.OrderByDescending(a => a.Timestamp) // Default: newest first
        };

        // Apply pagination
        var auditLogs = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Successfully fetched {Count} audit logs (page {Page} of {TotalPages})",
            auditLogs.Count, request.Page, (int)Math.Ceiling(totalItems / (double)request.PageSize));

        return PagedResult<AuditLogDto>.Create(auditLogs, request.Page, request.PageSize, totalItems);
    }
}
