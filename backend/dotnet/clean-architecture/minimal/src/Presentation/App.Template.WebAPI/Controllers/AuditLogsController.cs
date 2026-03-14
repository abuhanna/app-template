using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogById;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// Audit log management endpoints (Admin only)
/// </summary>
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly ISender _mediator;

    public AuditLogsController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get list of audit logs with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] string? search = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        [FromQuery] string? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = new GetAuditLogsQuery
        {
            Page = Math.Max(1, page),
            PageSize = Math.Clamp(pageSize, 1, 100),
            SortBy = sortBy,
            SortOrder = sortOrder,
            Search = search,
            EntityType = entityType,
            EntityId = entityId,
            UserId = userId,
            Action = action,
            FromDate = fromDate,
            ToDate = toDate
        };
        var result = await _mediator.Send(query);
        return Ok(PaginatedResponse<AuditLogDto>.From(result));
    }

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLog(long id)
    {
        var query = new GetAuditLogByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(ApiResponse.Fail($"Audit log with ID {id} not found"));
        }

        return Ok(ApiResponse.Ok(result, "Audit log retrieved successfully"));
    }
}
