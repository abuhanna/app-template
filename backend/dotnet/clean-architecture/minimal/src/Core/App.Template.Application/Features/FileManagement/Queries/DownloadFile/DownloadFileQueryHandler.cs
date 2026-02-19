using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.FileManagement.Queries.DownloadFile;

public class DownloadFileQueryHandler : IRequestHandler<DownloadFileQuery, FileDownloadResult?>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<DownloadFileQueryHandler> _logger;

    public DownloadFileQueryHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<DownloadFileQueryHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<FileDownloadResult?> Handle(DownloadFileQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.UploadedFiles
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            _logger.LogWarning("File not found: {Id}", request.Id);
            return null;
        }

        var fileStream = await _fileStorage.GetFileAsync(file.StoragePath, cancellationToken);

        if (fileStream == null)
        {
            _logger.LogWarning("File storage not found: {StoragePath}", file.StoragePath);
            return null;
        }

        return new FileDownloadResult(fileStream, file.ContentType, file.OriginalFileName);
    }
}
