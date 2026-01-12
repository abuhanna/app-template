using MediatR;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.DeleteDepartment;

public record DeleteDepartmentCommand : IRequest<bool>
{
    public long Id { get; init; }
}
