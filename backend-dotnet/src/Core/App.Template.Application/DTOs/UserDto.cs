namespace AppTemplate.Application.DTOs;

/// <summary>
/// User data transfer object
/// </summary>
public class UserDto
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Role { get; set; }
    public long? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>
/// Request for creating a new user
/// </summary>
public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Role { get; set; }
    public long? DepartmentId { get; set; }
}

/// <summary>
/// Request for updating a user
/// </summary>
public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Role { get; set; }
    public long? DepartmentId { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// Request for changing password
/// </summary>
public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
