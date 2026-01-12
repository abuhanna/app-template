using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.Authentication.Commands.UpdateMyProfile;

public class UpdateMyProfileCommandHandler : IRequestHandler<UpdateMyProfileCommand, UserDto>
{
    private readonly IBpmDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateMyProfileCommandHandler(IBpmDbContext context, ICurrentUserService currentUserService)
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

        // Update allowed fields only (name and email)
        user.Update(
            name: request.Name ?? user.Name,
            email: request.Email ?? user.Email,
            role: user.Role,  // Keep existing role
            departmentId: user.DepartmentId  // Keep existing department
        );

        await _context.SaveChangesAsync(cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
