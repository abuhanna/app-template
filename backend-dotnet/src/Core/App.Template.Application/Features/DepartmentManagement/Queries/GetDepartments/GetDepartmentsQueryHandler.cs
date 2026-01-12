using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;

/// <summary>
/// Handler for GetDepartmentsQuery
/// </summary>
public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, List<DepartmentDto>>
{
    private readonly IBpmDbContext _context;
    private readonly ILogger<GetDepartmentsQueryHandler> _logger;

    public GetDepartmentsQueryHandler(
        IBpmDbContext context,
        ILogger<GetDepartmentsQueryHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<DepartmentDto>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching departments from database");

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

        var departments = await query
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt,
                UserCount = d.Users.Count(u => u.IsActive)
            })
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Successfully fetched {Count} departments", departments.Count);

        return departments;
    }
}
