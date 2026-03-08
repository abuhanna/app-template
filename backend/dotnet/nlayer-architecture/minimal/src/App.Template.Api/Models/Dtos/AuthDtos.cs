namespace App.Template.Api.Models.Dtos;

public class LoginRequest
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public UserInfoDto? User { get; set; }
}

public class UserInfoDto
{
    public string? Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UserInfoResponseDto
{
    public string? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ClaimInfoDto> Claims { get; set; } = new();
}

public class ClaimInfoDto
{
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
