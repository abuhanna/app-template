using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;

/// <summary>
/// Query to get list of audit logs with pagination and filtering
/// </summary>
public record GetAuditLogsQuery : IRequest<PagedResult<AuditLogDto>>
{
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Column to sort by (e.g., "timestamp", "entityName", "action")
    /// </summary>
    public string? SortBy { get; init; }

    /// <summary>
    /// Sort direction: "asc" or "desc"
    /// </summary>
    public string? SortDir { get; init; } = "desc";

    /// <summary>
    /// Optional: Filter by entity name
    /// </summary>
    public string? EntityName { get; init; }

    /// <summary>
    /// Optional: Filter by entity ID
    /// </summary>
    public string? EntityId { get; init; }

    /// <summary>
    /// Optional: Filter by user ID
    /// </summary>
    public string? UserId { get; init; }

    /// <summary>
    /// Optional: Filter by action type
    /// </summary>
    public string? Action { get; init; }

    /// <summary>
    /// Optional: Filter from date
    /// </summary>
    public DateTime? FromDate { get; init; }

    /// <summary>
    /// Optional: Filter to date
    /// </summary>
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Optional: Search across entity name, entity ID, and user ID
    /// </summary>
    public string? Search { get; init; }
}
