namespace AppTemplate.Domain.Entities;

public class UploadedFile : AuditableEntity
{
    public string FileName { get; private set; } = null!;
    public string OriginalFileName { get; private set; } = null!;
    public string ContentType { get; private set; } = null!;
    public long FileSize { get; private set; }
    public string StoragePath { get; private set; } = null!;
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
