using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.CreateDepartment;

public record CreateDepartmentCommand : IRequest<DepartmentDto>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
