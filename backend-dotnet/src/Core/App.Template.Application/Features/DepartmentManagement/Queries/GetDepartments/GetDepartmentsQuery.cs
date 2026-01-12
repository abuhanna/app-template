using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;

/// <summary>
/// Query to get list of departments from local database
/// </summary>
public record GetDepartmentsQuery : IRequest<List<DepartmentDto>>
{
    /// <summary>
    /// Optional: Filter by active status
    /// </summary>
    public bool? IsActive { get; init; }

    /// <summary>
    /// Optional: Search by code or name
    /// </summary>
    public string? Search { get; init; }
}
