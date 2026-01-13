using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Queries.GetUsers;

/// <summary>
/// Handler for GetUsersQuery
/// </summary>
public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetUsersQueryHandler> _logger;

    public GetUsersQueryHandler(
        IApplicationDbContext context,
        ILogger<GetUsersQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching users from database");

        var query = _context.Users
            .Include(u => u.Department)
            .AsQueryable();

        // Apply filters
        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(u => u.DepartmentId == request.DepartmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.Name != null && u.Name.ToLower().Contains(search)));
        }

        var users = await query
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Email = u.Email,
                FullName = u.Name,
                Role = u.Role,
                DepartmentId = u.DepartmentId,
                DepartmentName = u.Department != null ? u.Department.Name : null,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync(cancellationToken);

        // Post-process name splitting
        foreach (var user in users)
        {
            var nameParts = user.FullName?.Split(' ', 2) ?? Array.Empty<string>();
            user.FirstName = nameParts.Length > 0 ? nameParts[0] : "";
            user.LastName = nameParts.Length > 1 ? nameParts[1] : "";
        }

        _logger.LogInformation("Successfully fetched {Count} users", users.Count);

        return users;
    }
}
