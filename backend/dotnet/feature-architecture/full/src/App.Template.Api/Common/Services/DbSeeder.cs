using App.Template.Api.Data;
using App.Template.Api.Features.Departments;
using App.Template.Api.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Common.Services;

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
        try
        {
            if (!await _context.Departments.AnyAsync())
            {
                _logger.LogInformation("Seeding default departments...");
                var department = new Department
                {
                    Code = "IT",
                    Name = "Information Technology",
                    Description = "IT Department",
                    IsActive = true
                };
                _context.Departments.Add(department);
                await _context.SaveChangesAsync();
            }

            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Seeding admin user...");
                var itDept = await _context.Departments.FirstAsync(d => d.Code == "IT");
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@apptemplate.local",
                    PasswordHash = _passwordHashService.HashPassword("Admin@123"),
                    Name = "System Administrator",
                    Role = "Admin",
                    DepartmentId = itDept.Id,
                    IsActive = true
                };
                _context.Users.Add(admin);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
