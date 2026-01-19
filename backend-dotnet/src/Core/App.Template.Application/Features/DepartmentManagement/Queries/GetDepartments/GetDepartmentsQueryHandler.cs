using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;

/// <summary>
/// Handler for GetDepartmentsQuery
/// </summary>
public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, PagedResult<DepartmentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<GetDepartmentsQueryHandler> _logger;

    public GetDepartmentsQueryHandler(
        IApplicationDbContext context,
        ILogger<GetDepartmentsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<DepartmentDto>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching departments from database with pagination");

        var query = _context.Departments.AsQueryable();

        // Apply filters
        if (request.IsActive.HasValue)
        {
            query = query.Where(d => d.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(d =>
                d.Code.ToLower().Contains(search) ||
                d.Name.ToLower().Contains(search));
        }

        // Get total count before pagination
        var totalItems = await query.CountAsync(cancellationToken);

        // Apply sorting
        var isDescending = request.SortDir?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? false;
        query = request.SortBy?.ToLower() switch
        {
            "code" => isDescending ? query.OrderByDescending(d => d.Code) : query.OrderBy(d => d.Code),
            "name" => isDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name),
            "createdat" => isDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            "updatedat" => isDescending ? query.OrderByDescending(d => d.UpdatedAt) : query.OrderBy(d => d.UpdatedAt),
            "isactive" => isDescending ? query.OrderByDescending(d => d.IsActive) : query.OrderBy(d => d.IsActive),
            _ => query.OrderBy(d => d.Name)
        };

        // Apply pagination
        var departments = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Successfully fetched {Count} departments (page {Page} of {TotalPages})",
            departments.Count, request.Page, (int)Math.Ceiling(totalItems / (double)request.PageSize));

        return PagedResult<DepartmentDto>.Create(departments, request.Page, request.PageSize, totalItems);
    }
}
