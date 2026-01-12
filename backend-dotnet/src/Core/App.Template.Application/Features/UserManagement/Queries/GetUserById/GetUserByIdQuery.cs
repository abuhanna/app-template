using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Queries.GetUserById;

public record GetUserByIdQuery : IRequest<UserDto?>
{
    public long Id { get; init; }
}
