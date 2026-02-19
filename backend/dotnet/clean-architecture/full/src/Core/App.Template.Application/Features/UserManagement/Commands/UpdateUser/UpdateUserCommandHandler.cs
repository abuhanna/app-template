using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UpdateUserCommandHandler> _logger;

    public UpdateUserCommandHandler(
        IApplicationDbContext context,
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
        var fullName = user.Name;

        if (request.FirstName != null || request.LastName != null)
        {
             var currentNameParts = user.Name?.Split(' ', 2) ?? Array.Empty<string>();
             var currentFirst = currentNameParts.Length > 0 ? currentNameParts[0] : "";
             var currentLast = currentNameParts.Length > 1 ? currentNameParts[1] : "";

             var newFirst = request.FirstName ?? currentFirst;
             var newLast = request.LastName ?? currentLast;

             fullName = $"{newFirst} {newLast}".Trim();
        }

        user.Update(fullName, request.Email, request.Role, request.DepartmentId);

        if (request.IsActive.HasValue)
        {
            user.SetActive(request.IsActive.Value);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User updated successfully: {Username} (ID: {Id})", user.Username, user.Id);

        var nameParts = user.Name?.Split(' ', 2) ?? Array.Empty<string>();
        var firstName = nameParts.Length > 0 ? nameParts[0] : "";
        var lastName = nameParts.Length > 1 ? nameParts[1] : "";

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = firstName,
            LastName = lastName,
            FullName = user.Name,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = departmentName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
