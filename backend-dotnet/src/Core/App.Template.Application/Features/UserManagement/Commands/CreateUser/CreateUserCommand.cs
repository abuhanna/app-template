using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Commands.CreateUser;

public record CreateUserCommand : IRequest<UserDto>
{
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string? Name { get; init; }
    public string? Role { get; init; }
    public long? DepartmentId { get; init; }
}
