using System.Security.Claims;

using Microsoft.AspNetCore.SignalR;

namespace App.Template.Api.Common.Infrastructure;

/// <summary>
/// Custom UserIdProvider for SignalR that resolves user identity from JWT claims.
/// Supports multiple claim types in priority order: jti, sub, userId, NameIdentifier.
/// </summary>
public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var user = connection.User;
        if (user == null) return null;

        return user.FindFirst("jti")?.Value
            ?? user.FindFirst("sub")?.Value
            ?? user.FindFirst("userId")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
