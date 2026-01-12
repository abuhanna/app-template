using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.UpdateDepartment;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, DepartmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateDepartmentCommandHandler> _logger;

    public UpdateDepartmentCommandHandler(
        IApplicationDbContext context,
        ILogger<UpdateDepartmentCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DepartmentDto> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating department: {Id}", request.Id);

        var department = await _context.Departments
            .Include(d => d.Users)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (department == null)
        {
            throw new InvalidOperationException($"Department with ID {request.Id} not found");
        }

        // Check if new code is unique
        if (!string.IsNullOrEmpty(request.Code) && request.Code != department.Code)
        {
            var existingDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Code == request.Code && d.Id != request.Id, cancellationToken);
            if (existingDepartment != null)
            {
                throw new InvalidOperationException($"Department code '{request.Code}' already exists");
            }
            department.UpdateCode(request.Code);
        }

        // Update other fields
        if (!string.IsNullOrEmpty(request.Name))
        {
            department.Update(request.Name, request.Description ?? department.Description);
        }
        else if (request.Description != null)
        {
            department.Update(department.Name, request.Description);
        }

        if (request.IsActive.HasValue)
        {
            department.SetActive(request.IsActive.Value);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Department updated successfully: {Code} (ID: {Id})", department.Code, department.Id);

        return new DepartmentDto
        {
            Id = department.Id,
            Code = department.Code,
            Name = department.Name,
            Description = department.Description,
            IsActive = department.IsActive,
            CreatedAt = department.CreatedAt,
            UserCount = department.Users.Count(u => u.IsActive)
        };
    }
}
