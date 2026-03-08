namespace AppTemplate.Application.DTOs.Auth;

/// <summary>
/// Login response with JWT token
/// </summary>
public record LoginResponseDto
{
    /// <summary>
    /// JWT access token
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; init; }

    /// <summary>
    /// Refresh token for obtaining new access tokens
    /// </summary>
    public string? RefreshToken { get; init; }

    /// <summary>
    /// User information
    /// </summary>
    public UserInfoDto? User { get; init; }
}

/// <summary>
/// Refresh token response (no user info)
/// </summary>
public record RefreshResponse
{
    /// <summary>
    /// New JWT access token
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; init; }

    /// <summary>
    /// New refresh token
    /// </summary>
    public string RefreshToken { get; init; } = string.Empty;
}
