using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Commands.DeleteUser;

public record DeleteUserCommand : IRequest<bool>
{
    public long Id { get; init; }
}
