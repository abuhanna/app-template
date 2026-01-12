using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.UpdateDepartment;

public record UpdateDepartmentCommand : IRequest<DepartmentDto>
{
    public long Id { get; init; }
    public string? Code { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public bool? IsActive { get; init; }
}
