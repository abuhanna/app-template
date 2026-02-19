namespace AppTemplate.Application.DTOs;

public class UploadedFileDto
{
    public long Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
}

public class UpdateFileRequest
{
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool? IsPublic { get; set; }
}
