namespace App.Template.Api.Models.Entities;

public enum AuditAction
{
    Created,
    Updated,
    Deleted
}

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
    public string? UserName { get; private set; }
    public string? Details { get; private set; }
    public string? IpAddress { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public static AuditLog Create(
        string entityName,
        string entityId,
        AuditAction action,
        string? oldValues,
        string? newValues,
        string? affectedColumns,
        string? userId,
        string? userName = null,
        string? details = null,
        string? ipAddress = null)
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
            UserName = userName,
            Details = details,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };
    }
}
