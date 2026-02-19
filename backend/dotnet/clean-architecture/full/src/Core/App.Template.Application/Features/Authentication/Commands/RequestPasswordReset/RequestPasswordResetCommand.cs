using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.RequestPasswordReset;

/// <summary>
/// Command to request a password reset email
/// </summary>
public record RequestPasswordResetCommand : IRequest<bool>
{
    /// <summary>
    /// Email address of the user requesting password reset
    /// </summary>
    public required string Email { get; init; }
}
