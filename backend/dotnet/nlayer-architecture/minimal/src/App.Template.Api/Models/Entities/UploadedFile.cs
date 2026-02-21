using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Template.Api.Models.Entities;

[Table("UploadedFiles")]
public class UploadedFile : AuditableEntity
{
    private UploadedFile() { } // EF Core constructor

    [Key]
    public long Id { get; private set; }

    [Required]
    [MaxLength(255)]
    public string FileName { get; private set; } = string.Empty; // GUID-based unique name

    [Required]
    [MaxLength(500)]
    public string OriginalFileName { get; private set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ContentType { get; private set; } = string.Empty;

    public long FileSize { get; private set; }

    [MaxLength(500)]
    public string StoragePath { get; private set; } = string.Empty; // e.g. "2025/02/guid.ext"

    public bool IsPublic { get; private set; }

    [MaxLength(1000)]
    public string? Description { get; private set; }

    [MaxLength(100)]
    public string? Category { get; private set; }

    public static UploadedFile Create(
        string fileName,
        string originalFileName,
        string contentType,
        long fileSize,
        string storagePath,
        bool isPublic = false,
        string? description = null,
        string? category = null)
    {
        return new UploadedFile
        {
            FileName = fileName,
            OriginalFileName = originalFileName,
            ContentType = contentType,
            FileSize = fileSize,
            StoragePath = storagePath,
            IsPublic = isPublic,
            Description = description,
            Category = category
        };
    }

    public void Update(string? description, string? category, bool? isPublic)
    {
        if (description != null) Description = description;
        if (category != null) Category = category;
        if (isPublic.HasValue) IsPublic = isPublic.Value;
    }
}
