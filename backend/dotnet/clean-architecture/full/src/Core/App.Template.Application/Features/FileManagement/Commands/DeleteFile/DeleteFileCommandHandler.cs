using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.FileManagement.Commands.DeleteFile;

public class DeleteFileCommandHandler : IRequestHandler<DeleteFileCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<DeleteFileCommandHandler> _logger;

    public DeleteFileCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<DeleteFileCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteFileCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting file with ID: {Id}", request.Id);

        var file = await _context.UploadedFiles
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (file == null)
        {
            _logger.LogWarning("File not found: {Id}", request.Id);
            return false;
        }

        // Delete from storage
        await _fileStorage.DeleteFileAsync(file.StoragePath, cancellationToken);

        // Delete from database
        _context.UploadedFiles.Remove(file);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("File deleted successfully: {Id}", request.Id);
        return true;
    }
}
