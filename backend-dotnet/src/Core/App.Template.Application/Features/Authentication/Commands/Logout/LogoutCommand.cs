using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.Logout;

/// <summary>
/// Command to logout and invalidate JWT token
/// </summary>
public record LogoutCommand : IRequest<bool>
{
    /// <summary>
    /// Authorization header containing JWT token
    /// </summary>
    public string? AuthorizationHeader { get; init; }
}
