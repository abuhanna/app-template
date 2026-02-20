using App.Template.Api.Data;
using App.Template.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public IQueryable<Department> GetQueryable() => _context.Departments.AsQueryable();

    public async Task<Department?> GetByIdAsync(long id)
        => await _context.Departments.FindAsync(id);

    public async Task<Department?> GetByCodeAsync(string code)
        => await _context.Departments.FirstOrDefaultAsync(d => d.Code == code);

    public async Task<Department> AddAsync(Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();
        return department;
    }

    public async Task<Department> UpdateAsync(Department department)
    {
        _context.Departments.Update(department);
        await _context.SaveChangesAsync();
        return department;
    }
}
