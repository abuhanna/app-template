using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AppTemplate.Application.Features.FileManagement.Queries.GetFile;

public class GetFileQueryHandler : IRequestHandler<GetFileQuery, UploadedFileDto?>
{
    private readonly IApplicationDbContext _context;

    public GetFileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UploadedFileDto?> Handle(GetFileQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.UploadedFiles
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            return null;
        }

        return new UploadedFileDto
        {
            Id = file.Id,
            FileName = file.FileName,
            OriginalFileName = file.OriginalFileName,
            ContentType = file.ContentType,
            FileSize = file.FileSize,
            Description = file.Description,
            Category = file.Category,
            IsPublic = file.IsPublic,
            CreatedAt = file.CreatedAt,
            UpdatedAt = file.UpdatedAt,
            CreatedBy = file.CreatedBy,
            DownloadUrl = $"/api/files/{file.Id}/download"
        };
    }
}
