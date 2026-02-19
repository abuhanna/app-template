using System.Security.Claims;

using Microsoft.AspNetCore.Http;

using AppTemplate.Application.Interfaces;

namespace AppTemplate.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Gets the current user ID from JWT claims
    /// Supports multiple claim types: jti (standard), sub, userId, NameIdentifier
    /// </summary>
    public string? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            // Try 'jti' claim first (JWT ID, often used for userId)
            return user.FindFirstValue("jti") ??
                   user.FindFirstValue("sub") ??
                   user.FindFirstValue("userId") ??
                   user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }

    /// <summary>
    /// Gets the current user's role from JWT claims
    /// Supports multiple claim types: roles (array), role, group, Role
    /// If roles is an array, returns the first value
    /// </summary>
    public string? UserGroup
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            // Check for 'roles' array first (common in JWT)
            // FindFirstValue will return the first value if it's an array
            return user.FindFirstValue("roles") ??
                   user.FindFirstValue("role") ??
                   user.FindFirstValue("group") ??
                   user.FindFirstValue(ClaimTypes.Role) ??
                   user.FindFirstValue("groups");
        }
    }

    /// <summary>
    /// Gets the current JWT token from the Authorization header
    /// </summary>
    public string? AuthToken
    {
        get
        {
            var header = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            // If header is empty, return null
            if (string.IsNullOrEmpty(header)) return null;
            
            // If it starts with "Bearer ", remove it (optional, depending on how it's used)
            // But here we return the full header value typically needed for passing downstream
            return header;
        }
    }
}