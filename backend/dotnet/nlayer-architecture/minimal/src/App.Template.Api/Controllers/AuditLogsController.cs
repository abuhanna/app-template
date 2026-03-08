using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Repositories;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

/// <summary>Audit log management endpoints (Admin only)</summary>
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogsController(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    /// <summary>Get list of audit logs with pagination and filtering</summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string sortOrder = "desc",
        [FromQuery] string? search = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        [FromQuery] string? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditLogRepository.GetPagedAsync(
            page, pageSize,
            sortBy, sortOrder,
            search, entityType,
            entityId, userId,
            action, fromDate,
            toDate, cancellationToken);

        return Ok(PaginatedResponse<AuditLogDto>.From(result, "Audit logs retrieved successfully"));
    }

    /// <summary>Get a single audit log by ID</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var log = await _auditLogRepository.GetByIdAsync(id, cancellationToken);
        if (log == null) return NotFound(ApiResponse.Fail("Audit log not found"));
        return Ok(ApiResponse.Ok(log, "Audit log retrieved successfully"));
    }
}
