using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace AppTemplate.Infrastructure.SignalR;

/// <summary>
/// Custom UserIdProvider for SignalR that matches the claim resolution logic
/// used by CurrentUserService for consistency across the application.
/// </summary>
public class CustomUserIdProvider : IUserIdProvider
{
    /// <summary>
    /// Gets the user ID from JWT claims.
    /// Supports multiple claim types in priority order: jti, sub, userId, NameIdentifier
    /// This matches the logic in CurrentUserService.
    /// </summary>
    public string? GetUserId(HubConnectionContext connection)
    {
        var user = connection.User;
        if (user == null) return null;

        // Try claim types in the same order as CurrentUserService
        // jti -> sub -> userId -> NameIdentifier
        return user.FindFirst("jti")?.Value ??
               user.FindFirst("sub")?.Value ??
               user.FindFirst("userId")?.Value ??
               user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
