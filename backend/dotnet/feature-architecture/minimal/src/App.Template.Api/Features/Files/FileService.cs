using App.Template.Api.Common.Models;
using App.Template.Api.Data;
using App.Template.Api.Features.Files.Dtos;

using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Files;

public interface IFileService
{
    Task<PagedResult<UploadedFileDto>> GetFilesAsync(string? category, bool? isPublic, int page, int pageSize);
    Task<UploadedFileDto?> GetFileAsync(long id);
    Task<UploadedFileDto> UploadFileAsync(Stream fileStream, string originalFileName, string contentType, long fileSize, string? description, string? category, bool isPublic);
    Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(long id);
    Task<bool> DeleteFileAsync(long id);
}

public class FileService : IFileService
{
    private readonly AppDbContext _context;
    private readonly string _storagePath;
    private readonly ILogger<FileService> _logger;

    public FileService(AppDbContext context, IConfiguration configuration, ILogger<FileService> logger)
    {
        _context = context;
        _logger = logger;
        _storagePath = configuration["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
            _logger.LogInformation("Created upload directory: {Path}", _storagePath);
        }
    }

    public async Task<PagedResult<UploadedFileDto>> GetFilesAsync(string? category, bool? isPublic, int page, int pageSize)
    {
        var query = _context.UploadedFiles.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(f => f.Category == category);

        if (isPublic.HasValue)
            query = query.Where(f => f.IsPublic == isPublic.Value);

        query = query.OrderByDescending(f => f.CreatedAt);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new UploadedFileDto
            {
                Id = f.Id,
                FileName = f.FileName,
                OriginalFileName = f.OriginalFileName,
                ContentType = f.ContentType,
                FileSize = f.FileSize,
                StoragePath = f.StoragePath,
                Description = f.Description,
                Category = f.Category,
                IsPublic = f.IsPublic,
                CreatedAt = f.CreatedAt,
                CreatedBy = f.CreatedBy
            })
            .ToListAsync();

        return new PagedResult<UploadedFileDto>
        {
            Items = items,
            Pagination = new PaginationMeta
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                HasNext = page * pageSize < totalItems,
                HasPrevious = page > 1
            }
        };
    }

    public async Task<UploadedFileDto?> GetFileAsync(long id)
    {
        var f = await _context.UploadedFiles.FindAsync(id);
        if (f == null) return null;

        return new UploadedFileDto
        {
            Id = f.Id,
            FileName = f.FileName,
            OriginalFileName = f.OriginalFileName,
            ContentType = f.ContentType,
            FileSize = f.FileSize,
            StoragePath = f.StoragePath,
            Description = f.Description,
            Category = f.Category,
            IsPublic = f.IsPublic,
            CreatedAt = f.CreatedAt,
            CreatedBy = f.CreatedBy
        };
    }

    public async Task<UploadedFileDto> UploadFileAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        long fileSize,
        string? description,
        string? category,
        bool isPublic)
    {
        var fileExtension = Path.GetExtension(originalFileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

        // Year/month subfolder structure
        var subFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var folderPath = Path.Combine(_storagePath, subFolder.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (!Directory.Exists(folderPath))
            Directory.CreateDirectory(folderPath);

        var fullPath = Path.Combine(folderPath, uniqueFileName);
        var storagePath = $"{subFolder}/{uniqueFileName}";

        await using var fileStreamOut = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fileStreamOut);

        _logger.LogInformation("File saved: {FileName} -> {StoragePath}", originalFileName, storagePath);

        var uploadedFile = new UploadedFile(uniqueFileName, originalFileName, contentType, fileSize, storagePath, description, category, isPublic);

        _context.UploadedFiles.Add(uploadedFile);
        await _context.SaveChangesAsync();

        return new UploadedFileDto
        {
            Id = uploadedFile.Id,
            FileName = uploadedFile.FileName,
            OriginalFileName = uploadedFile.OriginalFileName,
            ContentType = uploadedFile.ContentType,
            FileSize = uploadedFile.FileSize,
            StoragePath = uploadedFile.StoragePath,
            Description = uploadedFile.Description,
            Category = uploadedFile.Category,
            IsPublic = uploadedFile.IsPublic,
            CreatedAt = uploadedFile.CreatedAt,
            CreatedBy = uploadedFile.CreatedBy
        };
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(long id)
    {
        var fileRecord = await _context.UploadedFiles.FindAsync(id);
        if (fileRecord == null) return null;

        var fullPath = Path.Combine(_storagePath, fileRecord.StoragePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("File not found on disk: {StoragePath}", fileRecord.StoragePath);
            return null;
        }

        var memoryStream = new MemoryStream();
        await using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        await fileStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        return (memoryStream, fileRecord.ContentType, fileRecord.OriginalFileName);
    }

    public async Task<bool> DeleteFileAsync(long id)
    {
        var fileRecord = await _context.UploadedFiles.FindAsync(id);
        if (fileRecord == null) return false;

        // Delete physical file
        var fullPath = Path.Combine(_storagePath, fileRecord.StoragePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("File deleted: {StoragePath}", fileRecord.StoragePath);
        }

        _context.UploadedFiles.Remove(fileRecord);
        await _context.SaveChangesAsync();
        return true;
    }
}
