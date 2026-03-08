using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.Authentication.Commands.UpdateMyProfile;

public class UpdateMyProfileCommandHandler : IRequestHandler<UpdateMyProfileCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateMyProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserDto> Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var userIdString = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User not authenticated");

        if (!long.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("Invalid user ID");

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException("User not found");

        // Check if email is being changed and if it's already taken
        if (!string.IsNullOrWhiteSpace(request.Email) &&
            request.Email != user.Email)
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && u.Id != userId, cancellationToken);

            if (emailExists)
                throw new InvalidOperationException("Email is already in use");
        }

        // Build the new full name from first/last name parts
        var newName = BuildFullName(request.FirstName, request.LastName, user.Name);

        // Update allowed fields only (name and email)
        user.Update(
            name: newName,
            email: request.Email ?? user.Email,
            role: user.Role,  // Keep existing role
            departmentId: user.DepartmentId  // Keep existing department
        );

        await _context.SaveChangesAsync(cancellationToken);

        var nameParts = user.Name?.Split(' ', 2) ?? Array.Empty<string>();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = nameParts.Length > 0 ? nameParts[0] : "",
            LastName = nameParts.Length > 1 ? nameParts[1] : "",
            FullName = user.Name,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    private static string BuildFullName(string? firstName, string? lastName, string? currentName)
    {
        // If both parts supplied, build new name
        if (!string.IsNullOrWhiteSpace(firstName) || !string.IsNullOrWhiteSpace(lastName))
        {
            var currentParts = currentName?.Split(' ', 2) ?? Array.Empty<string>();
            var first = !string.IsNullOrWhiteSpace(firstName) ? firstName : (currentParts.Length > 0 ? currentParts[0] : "");
            var last = !string.IsNullOrWhiteSpace(lastName) ? lastName : (currentParts.Length > 1 ? currentParts[1] : "");
            return $"{first} {last}".Trim();
        }
        return currentName ?? "";
    }
}
