using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Queries.GetUsers;

/// <summary>
/// Query to get list of users from local database
/// </summary>
public record GetUsersQuery : IRequest<List<UserDto>>
{
    /// <summary>
    /// Optional: Filter by active status
    /// </summary>
    public bool? IsActive { get; init; }

    /// <summary>
    /// Optional: Filter by department ID
    /// </summary>
    public long? DepartmentId { get; init; }

    /// <summary>
    /// Optional: Search by username, email, or name
    /// </summary>
    public string? Search { get; init; }
}
