using App.Template.Api.Common.Entities;

namespace App.Template.Api.Features.Users;

/// <summary>
/// User entity - belongs to the Users feature module
/// </summary>
public class User : AuditableEntity
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string Role { get; set; } = "User";
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
}
