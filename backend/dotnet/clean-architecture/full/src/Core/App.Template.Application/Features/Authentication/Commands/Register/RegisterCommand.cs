using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.Register;

public record RegisterCommand : IRequest<UserDto>
{
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
}
