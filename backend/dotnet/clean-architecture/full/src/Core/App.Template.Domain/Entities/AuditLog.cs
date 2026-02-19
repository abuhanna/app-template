namespace AppTemplate.Domain.Entities;

/// <summary>
/// Represents an audit log entry that tracks changes to entities.
/// </summary>
public class AuditLog
{
    public long Id { get; private set; }

    /// <summary>
    /// Name of the entity that was modified (e.g., "User", "Department")
    /// </summary>
    public string EntityName { get; private set; } = string.Empty;

    /// <summary>
    /// Primary key of the entity that was modified
    /// </summary>
    public string EntityId { get; private set; } = string.Empty;

    /// <summary>
    /// The type of action performed: Created, Updated, Deleted
    /// </summary>
    public AuditAction Action { get; private set; }

    /// <summary>
    /// JSON representation of the entity's values before the change (null for Created)
    /// </summary>
    public string? OldValues { get; private set; }

    /// <summary>
    /// JSON representation of the entity's values after the change (null for Deleted)
    /// </summary>
    public string? NewValues { get; private set; }

    /// <summary>
    /// List of property names that were modified (JSON array)
    /// </summary>
    public string? AffectedColumns { get; private set; }

    /// <summary>
    /// User ID of who performed the action
    /// </summary>
    public string? UserId { get; private set; }

    /// <summary>
    /// UTC timestamp when the action occurred
    /// </summary>
    public DateTime Timestamp { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(
        string entityName,
        string entityId,
        AuditAction action,
        string? oldValues,
        string? newValues,
        string? affectedColumns,
        string? userId)
    {
        return new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            OldValues = oldValues,
            NewValues = newValues,
            AffectedColumns = affectedColumns,
            UserId = userId,
            Timestamp = DateTime.UtcNow
        };
    }
}

public enum AuditAction
{
    Created,
    Updated,
    Deleted
}
