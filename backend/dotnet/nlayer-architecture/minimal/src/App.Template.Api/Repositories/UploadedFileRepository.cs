using App.Template.Api.Data;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;

using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Repositories;

public class UploadedFileRepository : IUploadedFileRepository
{
    private readonly AppDbContext _context;

    public UploadedFileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UploadedFileDto>> GetPagedAsync(string? category, bool? isPublic, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.UploadedFiles.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(f => f.Category == category);

        if (isPublic.HasValue)
            query = query.Where(f => f.IsPublic == isPublic.Value);

        query = query.OrderByDescending(f => f.CreatedAt);

        var totalItems = await query.CountAsync(ct);
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
            .ToListAsync(ct);

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

    public async Task<UploadedFile?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        return await _context.UploadedFiles.FindAsync(new object[] { id }, ct);
    }

    public async Task<UploadedFile> AddAsync(UploadedFile file, CancellationToken ct = default)
    {
        _context.UploadedFiles.Add(file);
        await _context.SaveChangesAsync(ct);
        return file;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken ct = default)
    {
        var file = await _context.UploadedFiles.FindAsync(new object[] { id }, ct);
        if (file == null) return false;

        _context.UploadedFiles.Remove(file);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
