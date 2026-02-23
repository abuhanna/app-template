using AppTemplate.Application.Common.Extensions;
using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Queries.GetUsers;

/// <summary>
/// Handler for GetUsersQuery with pagination support
/// </summary>
public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PagedResult<UserDto>>
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

    public async Task<PagedResult<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching users from database with pagination");

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

        // Get total count before pagination
        var totalItems = await query.CountAsync(cancellationToken);

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            query = request.SortBy.ToLower() switch
            {
                "username" => request.SortDir == "desc" ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username),
                "email" => request.SortDir == "desc" ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "name" or "fullname" => request.SortDir == "desc" ? query.OrderByDescending(u => u.Name) : query.OrderBy(u => u.Name),
                "createdat" => request.SortDir == "desc" ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                "lastloginat" => request.SortDir == "desc" ? query.OrderByDescending(u => u.LastLoginAt) : query.OrderBy(u => u.LastLoginAt),
                "isactive" => request.SortDir == "desc" ? query.OrderByDescending(u => u.IsActive) : query.OrderBy(u => u.IsActive),
                "departmentname" => request.SortDir == "desc"
                    ? query.OrderByDescending(u => u.Department != null ? u.Department.Name : "")
                    : query.OrderBy(u => u.Department != null ? u.Department.Name : ""),
                _ => query.OrderBy(u => u.Username)
            };
        }
        else
        {
            query = query.OrderBy(u => u.Username);
        }

        // Apply pagination
        var users = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.Name,
                Role = u.Role,
                DepartmentId = u.DepartmentId,
                DepartmentName = u.Department != null ? u.Department.Name : null,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
                CreatedBy = u.CreatedBy,
                UpdatedBy = u.UpdatedBy,
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

        _logger.LogInformation("Successfully fetched {Count} users (page {Page} of {TotalPages})",
            users.Count, request.Page, (int)Math.Ceiling(totalItems / (double)request.PageSize));

        return PagedResult<UserDto>.Create(users, request.Page, request.PageSize, totalItems);
    }
}
