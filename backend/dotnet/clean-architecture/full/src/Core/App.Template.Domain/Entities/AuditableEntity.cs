namespace AppTemplate.Domain.Entities;

/// <summary>
/// Base class for entities that require audit tracking.
/// Provides CreatedAt, UpdatedAt, CreatedBy, and UpdatedBy fields.
/// These fields are automatically populated by the DbContext on SaveChanges.
/// </summary>
public abstract class AuditableEntity
{
    /// <summary>
    /// Unique identifier for the entity.
    /// </summary>
    public long Id { get; protected set; }

    /// <summary>
    /// UTC timestamp when the entity was created.
    /// </summary>
    public DateTime CreatedAt { get; protected set; }

    /// <summary>
    /// UTC timestamp when the entity was last updated.
    /// Null if never updated after creation.
    /// </summary>
    public DateTime? UpdatedAt { get; protected set; }

    /// <summary>
    /// User ID of who created the entity.
    /// Null for system-created entities or when user context is unavailable.
    /// </summary>
    public string? CreatedBy { get; protected set; }

    /// <summary>
    /// User ID of who last updated the entity.
    /// Null if never updated or when user context is unavailable.
    /// </summary>
    public string? UpdatedBy { get; protected set; }

    /// <summary>
    /// Sets the creation audit fields. Called by DbContext on insert.
    /// </summary>
    internal void SetCreatedAudit(string? userId)
    {
        CreatedAt = DateTime.UtcNow;
        CreatedBy = userId;
    }

    /// <summary>
    /// Sets the update audit fields. Called by DbContext on update.
    /// </summary>
    internal void SetUpdatedAudit(string? userId)
    {
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = userId;
    }
}
