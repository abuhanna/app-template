using AppTemplate.Application.DTOs;

namespace AppTemplate.Application.Interfaces;

/// <summary>
/// Service for resolving organization structure from external SSO
/// </summary>
public interface IOrganizationService
{
    /// <summary>
    /// Get list of departments from SSO
    /// </summary>
    /// <param name="authorizationHeader">JWT token from Authorization header</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of departments</returns>
    Task<List<DepartmentDto>> GetDepartmentsAsync(string? authorizationHeader, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get list of users from SSO
    /// </summary>
    /// <param name="authorizationHeader">JWT token from Authorization header</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of users</returns>
    Task<List<UserDto>> GetUsersAsync(string? authorizationHeader, CancellationToken cancellationToken = default);
}
