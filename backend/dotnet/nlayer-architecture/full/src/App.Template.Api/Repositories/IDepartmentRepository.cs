using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IDepartmentRepository
{
    IQueryable<Department> GetQueryable();
    Task<Department?> GetByIdAsync(long id);
    Task<Department?> GetByCodeAsync(string code);
    Task<Department> AddAsync(Department department);
    Task<Department> UpdateAsync(Department department);
}
