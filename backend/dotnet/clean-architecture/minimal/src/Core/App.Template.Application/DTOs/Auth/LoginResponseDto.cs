namespace AppTemplate.Application.DTOs.Auth;

/// <summary>
/// Login response with JWT token
/// </summary>
public record LoginResponseDto
{
    /// <summary>
    /// JWT access token
    /// </summary>
    public string Token { get; init; } = string.Empty;

    /// <summary>
    /// Token type (usually "Bearer")
    /// </summary>
    public string TokenType { get; init; } = "Bearer";

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; init; }

    /// <summary>
    /// User information
    /// </summary>
    public UserInfoDto? User { get; init; }
}
