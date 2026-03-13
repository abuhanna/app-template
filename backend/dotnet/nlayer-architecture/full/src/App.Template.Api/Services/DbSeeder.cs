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
            Code = "GEN",
            Name = "General",
            Description = "Default department",
            IsActive = true
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var admin = new User
        {
            Username = "admin",
            Email = "admin@apptemplate.com",
            PasswordHash = _passwordHashService.HashPassword("Admin@123"),
            FirstName = "Admin",
            LastName = "User",
            Role = "admin",
            DepartmentId = department.Id,
            IsActive = true
        };

        var sampleUser = new User
        {
            Username = "johndoe",
            Email = "user@apptemplate.com",
            PasswordHash = _passwordHashService.HashPassword("User@123"),
            FirstName = "John",
            LastName = "Doe",
            Role = "user",
            DepartmentId = department.Id,
            IsActive = true
        };

        _context.Users.Add(admin);
        _context.Users.Add(sampleUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seed data created successfully.");
    }
}
