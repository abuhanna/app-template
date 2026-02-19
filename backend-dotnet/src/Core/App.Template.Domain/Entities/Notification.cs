using AppTemplate.Domain.Enums;

namespace AppTemplate.Domain.Entities;

public class Notification
{
    public long Id { get; private set; }
    public string UserId { get; private set; } = null!;
    public string Title { get; private set; } = null!;
    public string Message { get; private set; } = null!;
    public NotificationType Type { get; private set; }
    public string? ReferenceId { get; private set; } // Can be Process ID or Task ID
    public string? ReferenceType { get; private set; } // "Process" or "Task"
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Notification() { }

    public Notification(string userId, string title, string message, NotificationType type, string? referenceId = null, string? referenceType = null)
    {
        UserId = userId;
        Title = title;
        Message = message;
        Type = type;
        ReferenceId = referenceId;
        ReferenceType = referenceType;
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsRead()
    {
        IsRead = true;
    }
}
