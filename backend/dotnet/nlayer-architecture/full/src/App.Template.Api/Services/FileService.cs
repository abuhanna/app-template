using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;

namespace App.Template.Api.Services;

public interface IFileService
{
    Task<UploadedFileDto> UploadAsync(IFormFile file, string? description, string? category, bool isPublic);
    Task<PagedResult<UploadedFileDto>> GetFilesAsync(FilesQueryParams queryParams);
    Task<UploadedFileDto?> GetMetadataAsync(long id);
    Task<(Stream Stream, string ContentType, string FileName)?> DownloadAsync(long id);
    Task<bool> DeleteAsync(long id);
}

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IWebHostEnvironment _environment;

    public FileService(IFileRepository fileRepository, IWebHostEnvironment environment)
    {
        _fileRepository = fileRepository;
        _environment = environment;
    }

    public async Task<UploadedFileDto> UploadAsync(IFormFile file, string? description, string? category, bool isPublic)
    {
        var now = DateTime.UtcNow;
        var relativePath = Path.Combine("uploads", now.Year.ToString(), now.Month.ToString("D2"));
        var uploadDir = Path.Combine(_environment.ContentRootPath, relativePath);

        if (!Directory.Exists(uploadDir))
            Directory.CreateDirectory(uploadDir);

        var ext = Path.GetExtension(file.FileName);
        var storedName = $"{Guid.NewGuid()}{ext}";
        var storagePath = Path.Combine(relativePath, storedName);
        var fullPath = Path.Combine(_environment.ContentRootPath, storagePath);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var entity = new UploadedFile
        {
            FileName = storedName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            StoragePath = storagePath,
            Description = description,
            Category = category,
            IsPublic = isPublic
        };

        var created = await _fileRepository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<PagedResult<UploadedFileDto>> GetFilesAsync(FilesQueryParams queryParams)
    {
        var query = _fileRepository.GetQueryable();

        if (!string.IsNullOrEmpty(queryParams.Category))
            query = query.Where(f => f.Category == queryParams.Category);

        if (queryParams.IsPublic.HasValue)
            query = query.Where(f => f.IsPublic == queryParams.IsPublic.Value);

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var s = queryParams.Search.ToLower();
            query = query.Where(f =>
                f.OriginalFileName.ToLower().Contains(s) ||
                (f.Description != null && f.Description.ToLower().Contains(s)));
        }

        query = query.OrderByDescending(f => f.CreatedAt);

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(f => new UploadedFileDto
        {
            Id = f.Id,
            FileName = f.FileName,
            OriginalFileName = f.OriginalFileName,
            ContentType = f.ContentType,
            FileSize = f.FileSize,
            Description = f.Description,
            Category = f.Category,
            IsPublic = f.IsPublic,
            CreatedAt = f.CreatedAt,
            DownloadUrl = $"/api/files/{f.Id}/download"
        });

        return await PagedResult<UploadedFileDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<UploadedFileDto?> GetMetadataAsync(long id)
    {
        var entity = await _fileRepository.GetByIdAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> DownloadAsync(long id)
    {
        var entity = await _fileRepository.GetByIdAsync(id);
        if (entity == null) return null;

        var fullPath = Path.Combine(_environment.ContentRootPath, entity.StoragePath);
        if (!File.Exists(fullPath)) return null;

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return (stream, entity.ContentType, entity.OriginalFileName);
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var entity = await _fileRepository.GetByIdAsync(id);
        if (entity == null) return false;

        var fullPath = Path.Combine(_environment.ContentRootPath, entity.StoragePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);

        await _fileRepository.DeleteAsync(entity);
        return true;
    }

    private static UploadedFileDto MapToDto(UploadedFile f) => new()
    {
        Id = f.Id,
        FileName = f.FileName,
        OriginalFileName = f.OriginalFileName,
        ContentType = f.ContentType,
        FileSize = f.FileSize,
        Description = f.Description,
        Category = f.Category,
        IsPublic = f.IsPublic,
        CreatedAt = f.CreatedAt,
        DownloadUrl = $"/api/files/{f.Id}/download"
    };
}
