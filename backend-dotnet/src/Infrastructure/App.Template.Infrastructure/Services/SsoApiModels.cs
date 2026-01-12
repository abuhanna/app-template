namespace AppTemplate.Infrastructure.Services;

/// <summary>
/// Response models for SSO API integration
/// </summary>
public class SsoUserResponse
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>
/// Request to get users by department roles
/// </summary>
public class GetUsersByDepartmentRolesRequest
{
    public List<DepartmentRoleFilter> DepartmentRoles { get; set; } = [];
}

public class DepartmentRoleFilter
{
    public string DepartmentCode { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
}
