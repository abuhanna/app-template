using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartmentById;

public record GetDepartmentByIdQuery : IRequest<DepartmentDto?>
{
    public long Id { get; init; }
}
