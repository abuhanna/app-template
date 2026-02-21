using System.Text.Json;

using App.Template.Api.Common.Entities;
using App.Template.Api.Common.Services;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Users;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace App.Template.Api.Data;

public class AppDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUserService)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // Entity types to exclude from audit logging
    private static readonly HashSet<Type> ExcludedFromAudit = new()
    {
        typeof(AuditLog),
        typeof(Notification)
    };

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        var auditEntries = OnBeforeSaveChanges();
        var result = await base.SaveChangesAsync(cancellationToken);
        await OnAfterSaveChangesAsync(auditEntries);
        return result;
    }

    private void ApplyAuditInfo()
    {
        var currentUserId = _currentUserService?.UserId;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = currentUserId;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = currentUserId;
                    break;
            }
        }
    }

    private List<AuditEntry> OnBeforeSaveChanges()
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();
        var currentUserId = _currentUserService?.UserId;

        foreach (var entry in ChangeTracker.Entries())
        {
            if (ExcludedFromAudit.Contains(entry.Entity.GetType()) ||
                entry.State == EntityState.Detached ||
                entry.State == EntityState.Unchanged)
            {
                continue;
            }

            var auditEntry = new AuditEntry(entry)
            {
                EntityName = entry.Entity.GetType().Name,
                UserId = currentUserId
            };

            switch (entry.State)
            {
                case EntityState.Added:
                    auditEntry.Action = AuditAction.Created;
                    foreach (var property in entry.Properties)
                    {
                        if (property.IsTemporary)
                        {
                            auditEntry.TemporaryProperties.Add(property);
                            continue;
                        }
                        auditEntry.NewValues[property.Metadata.Name] = property.CurrentValue;
                    }
                    break;

                case EntityState.Deleted:
                    auditEntry.Action = AuditAction.Deleted;
                    foreach (var property in entry.Properties)
                    {
                        auditEntry.OldValues[property.Metadata.Name] = property.OriginalValue;
                    }
                    break;

                case EntityState.Modified:
                    var isActiveProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsActive");
                    bool isSoftDelete = isActiveProp is { IsModified: true }
                        && isActiveProp.OriginalValue is true
                        && isActiveProp.CurrentValue is false;

                    if (isSoftDelete)
                    {
                        auditEntry.Action = AuditAction.Deleted;
                        foreach (var property in entry.Properties)
                        {
                            auditEntry.OldValues[property.Metadata.Name] = property.OriginalValue;
                        }
                    }
                    else
                    {
                        auditEntry.Action = AuditAction.Updated;
                        foreach (var property in entry.Properties)
                        {
                            if (property.IsModified)
                            {
                                auditEntry.AffectedColumns.Add(property.Metadata.Name);
                                auditEntry.OldValues[property.Metadata.Name] = property.OriginalValue;
                                auditEntry.NewValues[property.Metadata.Name] = property.CurrentValue;
                            }
                        }
                    }
                    break;
            }

            auditEntries.Add(auditEntry);
        }

        foreach (var entry in auditEntries.Where(e => !e.HasTemporaryProperties))
        {
            AuditLogs.Add(entry.ToAuditLog());
        }

        return auditEntries.Where(e => e.HasTemporaryProperties).ToList();
    }

    private async Task OnAfterSaveChangesAsync(List<AuditEntry> auditEntries)
    {
        if (auditEntries.Count == 0) return;

        foreach (var entry in auditEntries)
        {
            foreach (var prop in entry.TemporaryProperties)
            {
                entry.NewValues[prop.Metadata.Name] = prop.CurrentValue;
            }
            AuditLogs.Add(entry.ToAuditLog());
        }

        await base.SaveChangesAsync();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.IsActive).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);

            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // UploadedFile configuration
        modelBuilder.Entity<UploadedFile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FileSize).IsRequired();
            entity.Property(e => e.StoragePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.IsPublic).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);

            entity.HasIndex(e => e.FileName).IsUnique();
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CreatedBy);
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>();
            entity.Property(e => e.ReferenceId).HasMaxLength(50);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.IsRead).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => new { e.UserId, e.IsRead });
        });

        // AuditLog configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Action).IsRequired().HasConversion<string>();
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

    }
}

/// <summary>Helper class to capture audit information before and after save</summary>
internal class AuditEntry
{
    private readonly EntityEntry _entry;

    public AuditEntry(EntityEntry entry)
    {
        _entry = entry;
    }

    public string EntityName { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public AuditAction Action { get; set; }
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public List<string> AffectedColumns { get; } = new();
    public List<PropertyEntry> TemporaryProperties { get; } = new();

    public bool HasTemporaryProperties => TemporaryProperties.Count > 0;

    public string EntityId
    {
        get
        {
            var keyValues = _entry.Metadata.FindPrimaryKey()?.Properties
                .Select(p => _entry.Property(p.Name).CurrentValue?.ToString() ?? "")
                .ToArray();
            return keyValues != null ? string.Join(",", keyValues) : "";
        }
    }

    public AuditLog ToAuditLog()
    {
        var options = new JsonSerializerOptions { WriteIndented = false };
        return AuditLog.Create(
            EntityName,
            EntityId,
            Action,
            OldValues.Count > 0 ? JsonSerializer.Serialize(OldValues, options) : null,
            NewValues.Count > 0 ? JsonSerializer.Serialize(NewValues, options) : null,
            AffectedColumns.Count > 0 ? JsonSerializer.Serialize(AffectedColumns, options) : null,
            UserId
        );
    }
}
