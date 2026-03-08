namespace App.Template.Api.Models.Dtos;

public class AuditLogDto
{
    public long Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditLogsQueryParams
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? UserId { get; set; }
    public string? Action { get; set; }
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public string SortOrder { get; set; } = "desc";
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
