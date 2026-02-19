using Microsoft.EntityFrameworkCore;
using App.Template.Api.Features.Users;
using App.Template.Api.Common.Entities;

namespace App.Template.Api.Data;

public class AppDbContext : DbContext
{
    // Feature entities
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<App.Template.Api.Features.Files.UploadedFile> UploadedFiles => Set<App.Template.Api.Features.Files.UploadedFile>();

    private readonly App.Template.Api.Common.Services.ICurrentUserService _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, App.Template.Api.Common.Services.ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply configurations from all features
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.CreatedBy = userId;
            }
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
                entry.Entity.UpdatedBy = userId;
            }
        }

        var auditEntries = OnBeforeSaveChanges(userId);
        var result = base.SaveChangesAsync(cancellationToken);
        
        if (auditEntries.Count > 0)
        {
             OnAfterSaveChanges(auditEntries);
             return base.SaveChangesAsync(cancellationToken);
        }

        return result;
    }

    private List<AuditLog> OnBeforeSaveChanges(string? userId)
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditLog>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditLog
            {
                TableName = entry.Entity.GetType().Name,
                UserId = userId,
                DateTime = DateTime.UtcNow,
                Type = entry.State.ToString()
            };
            auditEntries.Add(auditEntry);
        }
        return auditEntries;
    }

    private void OnAfterSaveChanges(List<AuditLog> auditEntries)
    {
         AuditLogs.AddRange(auditEntries);
    }
}
