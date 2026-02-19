using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.ResetPassword;

/// <summary>
/// Command to reset user password using a reset token
/// </summary>
public record ResetPasswordCommand : IRequest<bool>
{
    /// <summary>
    /// The password reset token received via email
    /// </summary>
    public required string Token { get; init; }

    /// <summary>
    /// The new password
    /// </summary>
    public required string NewPassword { get; init; }

    /// <summary>
    /// Confirmation of the new password
    /// </summary>
    public required string ConfirmPassword { get; init; }
}
