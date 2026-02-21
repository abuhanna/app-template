using App.Template.Api.Common.Entities;

namespace App.Template.Api.Features.Files;

public class UploadedFile : AuditableEntity
{
    public long Id { get; private set; }
    public string FileName { get; private set; } = null!;         // Unique GUID-based name
    public string OriginalFileName { get; private set; } = null!; // Original uploaded name
    public string ContentType { get; private set; } = null!;
    public long FileSize { get; private set; }
    public string StoragePath { get; private set; } = null!;      // e.g. "2025/02/guid.ext"
    public string? Description { get; private set; }
    public string? Category { get; private set; }
    public bool IsPublic { get; private set; }

    private UploadedFile() { }

    public UploadedFile(
        string fileName,
        string originalFileName,
        string contentType,
        long fileSize,
        string storagePath,
        string? description = null,
        string? category = null,
        bool isPublic = false)
    {
        FileName = fileName;
        OriginalFileName = originalFileName;
        ContentType = contentType;
        FileSize = fileSize;
        StoragePath = storagePath;
        Description = description;
        Category = category;
        IsPublic = isPublic;
    }

    public void Update(string? description, string? category, bool? isPublic)
    {
        if (description != null) Description = description;
        if (category != null) Category = category;
        if (isPublic.HasValue) IsPublic = isPublic.Value;
    }
}
