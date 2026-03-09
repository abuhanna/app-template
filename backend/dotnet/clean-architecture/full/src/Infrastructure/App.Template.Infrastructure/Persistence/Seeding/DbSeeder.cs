
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Infrastructure.Persistence.Seeding;

public class DbSeeder
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(
        IApplicationDbContext context,
        IPasswordHashService passwordHashService,
        ILogger<DbSeeder> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            if (!_context.Departments.Any())
            {
                _logger.LogInformation("Seeding default departments...");

                var department = new Department(
                    "GEN",
                    "General",
                    "Default department"
                );

                _context.Departments.Add(department);
                await _context.SaveChangesAsync(CancellationToken.None);
            }

            if (!_context.Users.Any())
            {
                _logger.LogInformation("Seeding default users...");

                var generalDept = _context.Departments.First(d => d.Code == "GEN");

                var adminUser = new User(
                    "admin",
                    "admin@apptemplate.com",
                    _passwordHashService.HashPassword("Admin@123"),
                    "Admin User",
                    "admin",
                    generalDept.Id
                );

                var sampleUser = new User(
                    "johndoe",
                    "user@apptemplate.com",
                    _passwordHashService.HashPassword("User@123"),
                    "John Doe",
                    "user",
                    generalDept.Id
                );

                _context.Users.Add(adminUser);
                _context.Users.Add(sampleUser);
                await _context.SaveChangesAsync(CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
