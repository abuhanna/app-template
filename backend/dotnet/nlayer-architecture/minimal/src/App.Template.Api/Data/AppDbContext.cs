using Microsoft.EntityFrameworkCore;
using App.Template.Api.Models.Entities;

namespace App.Template.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();

    private readonly Services.ICurrentUserService _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, Services.ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
        });
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
             // For async saving of logs if needed, but here we can just save them after
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

            // Simplistic audit log for template
            // Real implementation would serialize OldValues/NewValues
            auditEntries.Add(auditEntry);
        }
        return auditEntries;
    }

    private void OnAfterSaveChanges(List<AuditLog> auditEntries)
    {
         AuditLogs.AddRange(auditEntries);
    }
}
