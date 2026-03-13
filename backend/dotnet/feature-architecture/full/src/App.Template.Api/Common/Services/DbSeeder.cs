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
                    Code = "GEN",
                    Name = "General",
                    Description = "Default department",
                    IsActive = true
                };
                _context.Departments.Add(department);
                await _context.SaveChangesAsync();
            }

            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Seeding default users...");
                var generalDept = await _context.Departments.FirstAsync(d => d.Code == "GEN");
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@apptemplate.com",
                    PasswordHash = _passwordHashService.HashPassword("Admin@123"),
                    FirstName = "Admin",
                    LastName = "User",
                    Role = "admin",
                    DepartmentId = generalDept.Id,
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
                    DepartmentId = generalDept.Id,
                    IsActive = true
                };
                _context.Users.Add(admin);
                _context.Users.Add(sampleUser);
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
