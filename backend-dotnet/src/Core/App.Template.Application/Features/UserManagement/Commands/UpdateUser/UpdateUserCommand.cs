using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;

public record UpdateUserCommand : IRequest<UserDto>
{
    public long Id { get; init; }
    public string? Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Role { get; init; }
    public long? DepartmentId { get; init; }
    public bool? IsActive { get; init; }
}
