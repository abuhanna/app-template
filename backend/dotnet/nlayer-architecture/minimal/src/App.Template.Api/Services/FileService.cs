using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;

namespace App.Template.Api.Services;

public interface IFileService
{
    Task<PagedResult<UploadedFileDto>> GetFilesAsync(string? category, bool? isPublic, int page, int pageSize, CancellationToken ct = default);
    Task<UploadedFileDto?> GetFileAsync(long id, CancellationToken ct = default);
    Task<UploadedFile> UploadFileAsync(Stream fileStream, string originalFileName, string contentType, long fileSize, string? description, string? category, bool isPublic, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(long id, CancellationToken ct = default);
    Task<bool> DeleteFileAsync(long id, CancellationToken ct = default);
}

public class FileService : IFileService
{
    private readonly IUploadedFileRepository _fileRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileService> _logger;

    public FileService(IUploadedFileRepository fileRepository, IConfiguration configuration, ILogger<FileService> logger)
    {
        _fileRepository = fileRepository;
        _configuration = configuration;
        _logger = logger;
    }

    private string GetBasePath()
    {
        return _configuration["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    }

    public Task<PagedResult<UploadedFileDto>> GetFilesAsync(string? category, bool? isPublic, int page, int pageSize, CancellationToken ct = default)
    {
        return _fileRepository.GetPagedAsync(category, isPublic, page, pageSize, ct);
    }

    public async Task<UploadedFileDto?> GetFileAsync(long id, CancellationToken ct = default)
    {
        var file = await _fileRepository.GetByIdAsync(id, ct);
        if (file == null) return null;

        return new UploadedFileDto
        {
            Id = file.Id,
            FileName = file.FileName,
            OriginalFileName = file.OriginalFileName,
            ContentType = file.ContentType,
            FileSize = file.FileSize,
            StoragePath = file.StoragePath,
            Description = file.Description,
            Category = file.Category,
            IsPublic = file.IsPublic,
            CreatedAt = file.CreatedAt,
            CreatedBy = file.CreatedBy
        };
    }

    public async Task<UploadedFile> UploadFileAsync(Stream fileStream, string originalFileName, string contentType, long fileSize, string? description, string? category, bool isPublic, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var yearMonth = now.ToString("yyyy/MM");
        var extension = Path.GetExtension(originalFileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var storagePath = $"{yearMonth}/{uniqueFileName}";

        var basePath = GetBasePath();
        var fullDir = Path.Combine(basePath, yearMonth.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(fullDir);

        var fullPath = Path.Combine(fullDir, uniqueFileName);
        using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await fileStream.CopyToAsync(stream, ct);
        }

        var uploadedFile = UploadedFile.Create(
            uniqueFileName,
            originalFileName,
            contentType,
            fileSize,
            storagePath,
            isPublic,
            description,
            category);

        return await _fileRepository.AddAsync(uploadedFile, ct);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(long id, CancellationToken ct = default)
    {
        var file = await _fileRepository.GetByIdAsync(id, ct);
        if (file == null) return null;

        var basePath = GetBasePath();
        var fullPath = Path.Combine(basePath, file.StoragePath.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(fullPath)) return null;

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return (stream, file.ContentType, file.FileName);
    }

    public async Task<bool> DeleteFileAsync(long id, CancellationToken ct = default)
    {
        var file = await _fileRepository.GetByIdAsync(id, ct);
        if (file == null) return false;

        var basePath = GetBasePath();
        var fullPath = Path.Combine(basePath, file.StoragePath.Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath))
        {
            try { File.Delete(fullPath); }
            catch (Exception ex) { _logger.LogWarning(ex, "Could not delete physical file {Path}", fullPath); }
        }

        return await _fileRepository.DeleteAsync(id, ct);
    }
}
