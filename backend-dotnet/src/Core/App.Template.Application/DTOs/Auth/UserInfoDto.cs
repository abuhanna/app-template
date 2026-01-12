namespace AppTemplate.Application.DTOs.Auth;

/// <summary>
/// User information in login response
/// </summary>
public record UserInfoDto
{
    public string? Id { get; init; }
    public string? Username { get; init; }
    public string? Email { get; init; }
    public string? Name { get; init; }
    public string? Role { get; init; }
    public string? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
}
