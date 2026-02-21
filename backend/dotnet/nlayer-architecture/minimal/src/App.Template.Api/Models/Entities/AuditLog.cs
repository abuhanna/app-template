using System.ComponentModel.DataAnnotations.Schema;

namespace App.Template.Api.Models.Entities;

public enum AuditAction
{
    Created,
    Updated,
    Deleted
}

[Table("AuditLogs")]
public class AuditLog
{
    private AuditLog() { } // EF Core constructor

    public long Id { get; private set; }
    public string EntityName { get; private set; } = string.Empty;
    public string EntityId { get; private set; } = string.Empty;
    public AuditAction Action { get; private set; }
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? AffectedColumns { get; private set; }
    public string? UserId { get; private set; }
    public DateTime Timestamp { get; private set; }

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
