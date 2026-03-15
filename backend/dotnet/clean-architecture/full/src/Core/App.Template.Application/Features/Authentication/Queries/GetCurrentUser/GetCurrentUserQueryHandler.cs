using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Interfaces;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;

/// <summary>
/// Handler for GetCurrentUserQuery
/// </summary>
public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserInfoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetCurrentUserQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserInfoDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userIdString = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User not authenticated");

        if (!long.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("Invalid user ID");

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException("User not found");

        return new UserInfoDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            IsActive = user.IsActive,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
