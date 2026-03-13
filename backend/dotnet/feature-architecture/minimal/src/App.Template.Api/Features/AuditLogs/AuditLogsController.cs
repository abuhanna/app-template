using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.AuditLogs.Dtos;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.AuditLogs;

/// <summary>Audit log management endpoints (Admin only)</summary>
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>Get list of audit logs with pagination and filtering</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "desc",
        [FromQuery] string? search = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        [FromQuery] string? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
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

        if (!string.IsNullOrEmpty(action) && Enum.TryParse<App.Template.Api.Common.Entities.AuditAction>(action, true, out var auditAction))
            query = query.Where(a => a.Action == auditAction);

        if (fromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.CreatedAt <= toDate.Value);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(a => a.EntityName.Contains(search) || a.EntityId.Contains(search));

        // Sorting
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

        var pagedResult = await PagedResult<AuditLogDto>.CreateAsync(
            query.Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action.ToString(),
                UserId = a.UserId,
                UserName = a.UserName ?? a.UserId,
                Details = a.Details ?? a.NewValues ?? a.OldValues,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            }),
            page,
            pageSize);

        return Ok(PaginatedResponse<AuditLogDto>.From(pagedResult));
    }

    /// <summary>Get a single audit log by ID</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLog(long id)
    {
        var auditLog = await _context.AuditLogs
            .Where(a => a.Id == id)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action.ToString(),
                UserId = a.UserId,
                UserName = a.UserName ?? a.UserId,
                Details = a.Details ?? a.NewValues ?? a.OldValues,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (auditLog == null)
            return NotFound(ApiResponse.Fail($"Audit log with ID {id} not found"));

        return Ok(ApiResponse.Ok(auditLog));
    }
}
