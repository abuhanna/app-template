using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    private readonly IBpmDbContext _context;
    private readonly ILogger<UpdateUserCommandHandler> _logger;

    public UpdateUserCommandHandler(
        IBpmDbContext context,
        ILogger<UpdateUserCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating user: {Id}", request.Id);

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {request.Id} not found");
        }

        // Check if email is already taken by another user
        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Id != request.Id, cancellationToken);
            if (existingUser != null)
            {
                throw new InvalidOperationException($"Email '{request.Email}' is already registered");
            }
        }

        // Validate department if provided
        string? departmentName = user.Department?.Name;
        if (request.DepartmentId.HasValue && request.DepartmentId != user.DepartmentId)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, cancellationToken);
            if (department == null)
            {
                throw new InvalidOperationException($"Department with ID {request.DepartmentId} not found");
            }
            departmentName = department.Name;
        }

        // Update user
        user.Update(request.Name, request.Email, request.Role, request.DepartmentId);

        if (request.IsActive.HasValue)
        {
            user.SetActive(request.IsActive.Value);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User updated successfully: {Username} (ID: {Id})", user.Username, user.Id);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = departmentName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
