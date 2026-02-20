using App.Template.Api.Data;
using App.Template.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Services;

public class DbSeeder
{
    private readonly AppDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(AppDbContext context, IPasswordHashService passwordHashService, ILogger<DbSeeder> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        if (await _context.Users.AnyAsync()) return;

        _logger.LogInformation("Seeding initial data...");

        var department = new Department
        {
            Name = "IT Department",
            Code = "IT",
            Description = "Information Technology Department",
            IsActive = true
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var admin = new User
        {
            Username = "admin",
            Email = "admin@apptemplate.local",
            PasswordHash = _passwordHashService.HashPassword("Admin@123"),
            Name = "Administrator",
            Role = "Admin",
            DepartmentId = department.Id,
            IsActive = true
        };

        _context.Users.Add(admin);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seed data created successfully.");
    }
}
