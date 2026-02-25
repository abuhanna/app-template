using System.Text.Json;

using App.Template.Api.Models.Entities;
using App.Template.Api.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace App.Template.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();
    public DbSet<Notification> Notifications => Set<Notification>();

    private readonly ICurrentUserService _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UploadedFile entity configuration
        modelBuilder.Entity<UploadedFile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StoragePath).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.HasIndex(e => e.FileName).IsUnique();
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CreatedBy);
        });

        // AuditLog entity configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Action).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.OldValues).HasColumnType("text");
            entity.Property(e => e.NewValues).HasColumnType("text");
            entity.Property(e => e.AffectedColumns).HasColumnType("text");
            entity.Property(e => e.UserId).HasMaxLength(100);
            entity.Property(e => e.Timestamp).IsRequired();
            entity.HasIndex(e => e.EntityName);
            entity.HasIndex(e => e.EntityId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Timestamp);
        });

        // Notification entity configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.ReferenceId).HasMaxLength(100);
            entity.Property(e => e.ReferenceType).HasMaxLength(100);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        var utcNow = DateTime.UtcNow;

        // Set audit fields for AuditableEntity instances
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.CreatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
                entry.Entity.UpdatedBy = userId;
            }
        }

        // Collect audit entries before save
        var auditEntries = OnBeforeSaveChanges(userId);

        var result = await base.SaveChangesAsync(cancellationToken);

        // After save: fill in auto-generated IDs for audit entries with temporary properties
        if (auditEntries.Any(e => e.HasTemporaryProperties))
        {
            await OnAfterSaveChangesAsync(auditEntries, cancellationToken);
        }

        return result;
    }

    private List<AuditEntryHelper> OnBeforeSaveChanges(string? userId)
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntryHelper>();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.Entity is Notification ||
                entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntryHelper(entry)
            {
                UserId = userId,
                EntityName = entry.Entity.GetType().Name,
                Action = entry.State switch
                {
                    EntityState.Added => AuditAction.Created,
                    EntityState.Deleted => AuditAction.Deleted,
                    _ => AuditAction.Updated
                }
            };

            // Detect soft delete: IsActive changing from true → false
            if (entry.State == EntityState.Modified)
            {
                var isActiveProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsActive");
                if (isActiveProperty != null &&
                    isActiveProperty.CurrentValue is false &&
                    isActiveProperty.OriginalValue is true)
                {
                    auditEntry.Action = AuditAction.Deleted;
                }
            }

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                var propertyName = property.Metadata.Name;

                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.SetPrimaryKey(property);
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;
                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;
                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.ChangedColumns.Add(propertyName);
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }

            auditEntries.Add(auditEntry);
        }

        // Save entries without temporary properties immediately
        foreach (var auditEntry in auditEntries.Where(e => !e.HasTemporaryProperties))
        {
            AuditLogs.Add(auditEntry.ToAuditLog());
        }

        return auditEntries;
    }

    private async Task OnAfterSaveChangesAsync(List<AuditEntryHelper> auditEntries, CancellationToken ct)
    {
        var pendingEntries = auditEntries.Where(e => e.HasTemporaryProperties).ToList();
        if (pendingEntries.Count == 0) return;

        foreach (var auditEntry in pendingEntries)
        {
            AuditLogs.Add(auditEntry.ToAuditLog());
        }

        await base.SaveChangesAsync(ct);
    }
}

/// <summary>Helper class to capture audit information before and after save</summary>
internal class AuditEntryHelper
{
    private readonly EntityEntry _entry;
    private PropertyEntry? _primaryKey;

    public AuditEntryHelper(EntityEntry entry)
    {
        _entry = entry;
    }

    public string? UserId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public AuditAction Action { get; set; }
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public List<string> ChangedColumns { get; } = new();
    public List<PropertyEntry> TemporaryProperties { get; } = new();
    public bool HasTemporaryProperties => TemporaryProperties.Count > 0;

    public string EntityId => _primaryKey?.CurrentValue?.ToString() ?? "0";

    public void SetPrimaryKey(PropertyEntry pk) => _primaryKey = pk;

    public AuditLog ToAuditLog()
    {
        // Fill in temporary properties (auto-generated IDs)
        foreach (var prop in TemporaryProperties)
        {
            if (prop.Metadata.IsPrimaryKey())
                _primaryKey = prop;
            else
                NewValues[prop.Metadata.Name] = prop.CurrentValue;
        }

        return AuditLog.Create(
            EntityName,
            EntityId,
            Action,
            OldValues.Count > 0 ? JsonSerializer.Serialize(OldValues) : null,
            NewValues.Count > 0 ? JsonSerializer.Serialize(NewValues) : null,
            ChangedColumns.Count > 0 ? string.Join(",", ChangedColumns) : null,
            UserId);
    }
}
