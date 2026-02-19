using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;

/// <summary>
/// Query to get list of departments from local database with pagination
/// </summary>
public record GetDepartmentsQuery : IRequest<PagedResult<DepartmentDto>>
{
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; init; } = 10;

    /// <summary>
    /// Column to sort by (e.g., "name", "code", "createdAt")
    /// </summary>
    public string? SortBy { get; init; }

    /// <summary>
    /// Sort direction: "asc" or "desc"
    /// </summary>
    public string? SortDir { get; init; } = "asc";

    /// <summary>
    /// Optional: Filter by active status
    /// </summary>
    public bool? IsActive { get; init; }

    /// <summary>
    /// Optional: Search by code or name
    /// </summary>
    public string? Search { get; init; }
}
