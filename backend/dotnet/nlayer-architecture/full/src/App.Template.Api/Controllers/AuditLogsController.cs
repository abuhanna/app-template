using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<AuditLogDto>>> GetAll([FromQuery] AuditLogsQueryParams queryParams)
    {
        var result = await _auditLogService.GetAuditLogsAsync(queryParams);
        return Ok(PaginatedResponse<AuditLogDto>.From(result, "Audit logs retrieved successfully"));
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiResponse<AuditLogDto>>> GetById(long id)
    {
        var log = await _auditLogService.GetByIdAsync(id);
        if (log == null) return NotFound(ApiResponse.Fail("Audit log not found"));
        return Ok(ApiResponse.Ok(log, "Audit log retrieved successfully"));
    }
}
