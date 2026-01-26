using App.Template.Api.Data;
using App.Template.Api.Features.Departments.Dtos;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Departments;

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto?> GetByIdAsync(int id);
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDto);
    Task<DepartmentDto?> UpdateAsync(int id, UpdateDepartmentDto updateDto);
    Task<bool> DeleteAsync(int id);
}

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public DepartmentService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        var departments = await _context.Set<Department>().ToListAsync();
        return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        var department = await _context.Set<Department>().FindAsync(id);
        return department == null ? null : _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDto)
    {
        var department = _mapper.Map<Department>(createDto);
        _context.Set<Department>().Add(department);
        await _context.SaveChangesAsync();
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto?> UpdateAsync(int id, UpdateDepartmentDto updateDto)
    {
        var department = await _context.Set<Department>().FindAsync(id);
        if (department == null) return null;

        if (updateDto.Name != null) department.Name = updateDto.Name;
        if (updateDto.Code != null) department.Code = updateDto.Code;
        if (updateDto.Description != null) department.Description = updateDto.Description;

        await _context.SaveChangesAsync();
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var department = await _context.Set<Department>().FindAsync(id);
        if (department == null) return false;

        _context.Set<Department>().Remove(department);
        await _context.SaveChangesAsync();
        return true;
    }
}
