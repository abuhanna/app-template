namespace App.Template.Api.Models.Entities;

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error
}

public class Notification
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public void MarkAsRead() => IsRead = true;
}
