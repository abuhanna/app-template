using System.Text.Json;
using AppTemplate.Domain.Entities;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace AppTemplate.Infrastructure.Persistence;

/// <summary>
/// Helper class to capture entity changes before and after save for audit logging.
/// </summary>
public class AuditEntry
{
    public EntityEntry Entry { get; }
    public string EntityName { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public AuditAction Action { get; set; }
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public List<string> AffectedColumns { get; } = new();
    public List<PropertyEntry> TemporaryProperties { get; } = new();

    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    /// <summary>
    /// Indicates if this entry has temporary values that need to be resolved after save
    /// (e.g., database-generated primary keys)
    /// </summary>
    public bool HasTemporaryProperties => TemporaryProperties.Any();

    /// <summary>
    /// Converts this audit entry to an AuditLog entity.
    /// </summary>
    public AuditLog ToAuditLog()
    {
        // Get the primary key value
        var primaryKey = Entry.Properties
            .Where(p => p.Metadata.IsPrimaryKey())
            .Select(p => p.CurrentValue?.ToString())
            .FirstOrDefault() ?? "";

        return AuditLog.Create(
            entityName: EntityName,
            entityId: primaryKey,
            action: Action,
            oldValues: OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
            newValues: NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
            affectedColumns: AffectedColumns.Count == 0 ? null : JsonSerializer.Serialize(AffectedColumns),
            userId: UserId
        );
    }
}
