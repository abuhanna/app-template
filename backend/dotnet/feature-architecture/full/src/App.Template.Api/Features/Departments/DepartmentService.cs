using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.Departments.Dtos;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Departments;

public interface IDepartmentService
{
    Task<PagedResult<DepartmentDto>> GetDepartmentsAsync(DeptQueryParams queryParams);
    Task<DepartmentDto?> GetByIdAsync(long id);
    Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request);
    Task<DepartmentDto?> UpdateAsync(long id, UpdateDepartmentRequest request);
    Task<bool> DeleteAsync(long id);
}

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _context;

    public DepartmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<DepartmentDto>> GetDepartmentsAsync(DeptQueryParams queryParams)
    {
        var query = _context.Departments.AsQueryable();

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(d =>
                d.Name.ToLower().Contains(search) ||
                d.Code.ToLower().Contains(search));
        }

        if (queryParams.IsActive.HasValue)
            query = query.Where(d => d.IsActive == queryParams.IsActive.Value);

        query = (queryParams.SortBy?.ToLower(), queryParams.SortDir?.ToLower()) switch
        {
            ("name", "desc") => query.OrderByDescending(d => d.Name),
            ("name", _) => query.OrderBy(d => d.Name),
            ("code", "desc") => query.OrderByDescending(d => d.Code),
            ("code", _) => query.OrderBy(d => d.Code),
            ("createdat", "desc") => query.OrderByDescending(d => d.CreatedAt),
            ("createdat", _) => query.OrderBy(d => d.CreatedAt),
            _ => query.OrderBy(d => d.Name)
        };

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Code = d.Code,
            Name = d.Name,
            Description = d.Description,
            IsActive = d.IsActive,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        });

        return await PagedResult<DepartmentDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<DepartmentDto?> GetByIdAsync(long id)
    {
        var dept = await _context.Departments.FindAsync(id);
        return dept == null ? null : MapToDto(dept);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request)
    {
        var existing = await _context.Departments
            .FirstOrDefaultAsync(d => d.Code == request.Code);
        if (existing != null)
            throw new InvalidOperationException("Department code is already in use");

        var dept = new Department
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            IsActive = true
        };

        _context.Departments.Add(dept);
        await _context.SaveChangesAsync();
        return MapToDto(dept);
    }

    public async Task<DepartmentDto?> UpdateAsync(long id, UpdateDepartmentRequest request)
    {
        var dept = await _context.Departments.FindAsync(id);
        if (dept == null) return null;

        if (request.Code != null && request.Code != dept.Code)
        {
            var codeExists = await _context.Departments
                .AnyAsync(d => d.Code == request.Code && d.Id != id);
            if (codeExists)
                throw new InvalidOperationException("Department code is already in use");
            dept.Code = request.Code;
        }

        if (request.Name != null) dept.Name = request.Name;
        if (request.Description != null) dept.Description = request.Description;
        if (request.IsActive.HasValue) dept.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync();
        return MapToDto(dept);
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var dept = await _context.Departments
            .Include(d => d.Users)
            .FirstOrDefaultAsync(d => d.Id == id);
        if (dept == null) return false;

        if (dept.Users.Any(u => u.IsActive))
            throw new InvalidOperationException("Cannot delete department with active users. Reassign or deactivate users first.");

        dept.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private static DepartmentDto MapToDto(Department dept) => new()
    {
        Id = dept.Id,
        Code = dept.Code,
        Name = dept.Name,
        Description = dept.Description,
        IsActive = dept.IsActive,
        CreatedAt = dept.CreatedAt,
        UpdatedAt = dept.UpdatedAt
    };
}
