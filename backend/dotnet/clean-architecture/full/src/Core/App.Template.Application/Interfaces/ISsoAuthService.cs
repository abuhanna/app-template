using AppTemplate.Application.DTOs.Auth;

namespace AppTemplate.Application.Interfaces;

/// <summary>
/// Service for SSO authentication operations
/// </summary>
public interface ISsoAuthService
{
    /// <summary>
    /// Login to SSO and obtain JWT token
    /// </summary>
    /// <param name="username">Username or email</param>
    /// <param name="password">User password</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Login response with JWT token</returns>
    Task<LoginResponseDto> LoginAsync(string username, string password, CancellationToken cancellationToken = default);

    /// <summary>
    /// Logout from SSO and invalidate JWT token
    /// </summary>
    /// <param name="authorizationHeader">JWT token from Authorization header</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if logout successful</returns>
    Task<bool> LogoutAsync(string? authorizationHeader, CancellationToken cancellationToken = default);
}
