
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
                    "IT",
                    "Information Technology",
                    "IT Department"
                );
                // IsActive is true by default in constructor
                // CreatedAt is handled by DbContext or we rely on AuditInfo logic if we want, but DbContext sets it on SaveChanges if not set, or we can't set it since it inherits from AuditableEntity which likely has private set. 
                // Actually AuditableEntity usually has standard properties. Let's assume Entity Framework will handle it via the Override SaveChanges method seen in ApplicationDbContext.

                _context.Departments.Add(department);
                await _context.SaveChangesAsync(CancellationToken.None);
            }

            if (!_context.Users.Any())
            {
                _logger.LogInformation("Seeding admin user...");

                var adminUser = new User(
                    "admin",
                    "admin@apptemplate.local",
                    _passwordHashService.HashPassword("Admin@123"),
                    "System Administrator",
                    "Admin",
                    _context.Departments.First(d => d.Code == "IT").Id
                );
                // IsActive is true by default

                _context.Users.Add(adminUser);
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
