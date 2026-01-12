using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.CreateDepartment;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, DepartmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateDepartmentCommandHandler> _logger;

    public CreateDepartmentCommandHandler(
        IApplicationDbContext context,
        ILogger<CreateDepartmentCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DepartmentDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating department: {Code}", request.Code);

        // Check if code already exists
        var existingDepartment = await _context.Departments
            .FirstOrDefaultAsync(d => d.Code == request.Code, cancellationToken);
        if (existingDepartment != null)
        {
            throw new InvalidOperationException($"Department code '{request.Code}' already exists");
        }

        // Create department
        var department = new Department(request.Code, request.Name, request.Description);

        _context.Departments.Add(department);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Department created successfully: {Code} (ID: {Id})", department.Code, department.Id);

        return new DepartmentDto
        {
            Id = department.Id,
            Code = department.Code,
            Name = department.Name,
            Description = department.Description,
            IsActive = department.IsActive,
            CreatedAt = department.CreatedAt,
            UserCount = 0
        };
    }
}
