using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Template.Api.Models.Entities;

[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string Type { get; set; } = string.Empty; // Create, Update, Delete
    public string TableName { get; set; } = string.Empty;
    public DateTime DateTime { get; set; } = DateTime.UtcNow;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AffectedColumns { get; set; }
    public string? PrimaryKey { get; set; }
}
