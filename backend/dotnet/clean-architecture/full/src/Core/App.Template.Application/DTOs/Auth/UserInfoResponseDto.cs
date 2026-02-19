namespace AppTemplate.Application.DTOs.Auth;

/// <summary>
/// User information response from /auth/me endpoint
/// </summary>
public record UserInfoResponseDto
{
    public string? UserId { get; init; }
    public string? Username { get; init; }
    public string? Email { get; init; }
    public string? Role { get; init; }
    public List<ClaimInfoDto> Claims { get; init; } = new();
}

/// <summary>
/// JWT claim information
/// </summary>
public record ClaimInfoDto
{
    public string Type { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
}
