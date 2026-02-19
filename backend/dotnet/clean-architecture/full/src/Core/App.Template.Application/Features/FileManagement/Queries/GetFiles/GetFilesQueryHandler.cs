using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.FileManagement.Queries.GetFiles;

public class GetFilesQueryHandler : IRequestHandler<GetFilesQuery, List<UploadedFileDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFilesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UploadedFileDto>> Handle(GetFilesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.UploadedFiles.AsQueryable();

        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(f => f.Category == request.Category);
        }

        if (request.IsPublic.HasValue)
        {
            query = query.Where(f => f.IsPublic == request.IsPublic.Value);
        }

        var files = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new UploadedFileDto
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
                UpdatedAt = f.UpdatedAt,
                CreatedBy = f.CreatedBy,
                DownloadUrl = $"/api/files/{f.Id}/download"
            })
            .ToListAsync(cancellationToken);

        return files;
    }
}
