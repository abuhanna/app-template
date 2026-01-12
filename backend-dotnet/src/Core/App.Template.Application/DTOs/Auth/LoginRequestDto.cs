namespace AppTemplate.Application.DTOs.Auth;

/// <summary>
/// Login request payload
/// </summary>
public record LoginRequestDto
{
    /// <summary>
    /// Username or email
    /// </summary>
    public string Username { get; init; } = string.Empty;

    /// <summary>
    /// User password
    /// </summary>
    public string Password { get; init; } = string.Empty;
}
