using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Commands.ChangePassword;

public record ChangePasswordCommand : IRequest<bool>
{
    public long UserId { get; init; }
    public string CurrentPassword { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}
