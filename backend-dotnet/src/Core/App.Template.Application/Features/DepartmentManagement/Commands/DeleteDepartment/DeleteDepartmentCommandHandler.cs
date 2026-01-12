using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.DeleteDepartment;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteDepartmentCommandHandler> _logger;

    public DeleteDepartmentCommandHandler(
        IApplicationDbContext context,
        ILogger<DeleteDepartmentCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting department: {Id}", request.Id);

        var department = await _context.Departments
            .Include(d => d.Users)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (department == null)
        {
            throw new InvalidOperationException($"Department with ID {request.Id} not found");
        }

        // Check if department has active users
        if (department.Users.Any(u => u.IsActive))
        {
            throw new InvalidOperationException("Cannot delete department with active users. Reassign or deactivate users first.");
        }

        // Soft delete - deactivate instead of removing
        department.SetActive(false);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Department deactivated successfully: {Code} (ID: {Id})", department.Code, department.Id);

        return true;
    }
}
