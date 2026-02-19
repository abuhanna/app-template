using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.FileManagement.Commands.UploadFile;

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, UploadedFileDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<UploadFileCommandHandler> _logger;

    public UploadFileCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorage,
        ILogger<UploadFileCommandHandler> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task<UploadedFileDto> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Uploading file: {FileName}", request.FileName);

        // Save file to storage
        var (fileName, storagePath) = await _fileStorage.SaveFileAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            cancellationToken);

        // Create database record
        var uploadedFile = new UploadedFile(
            fileName,
            request.FileName,
            request.ContentType,
            request.FileSize,
            storagePath,
            request.Description,
            request.Category,
            request.IsPublic);

        _context.UploadedFiles.Add(uploadedFile);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("File uploaded successfully: {FileName} (ID: {Id})", request.FileName, uploadedFile.Id);

        return new UploadedFileDto
        {
            Id = uploadedFile.Id,
            FileName = uploadedFile.FileName,
            OriginalFileName = uploadedFile.OriginalFileName,
            ContentType = uploadedFile.ContentType,
            FileSize = uploadedFile.FileSize,
            Description = uploadedFile.Description,
            Category = uploadedFile.Category,
            IsPublic = uploadedFile.IsPublic,
            CreatedAt = uploadedFile.CreatedAt,
            CreatedBy = uploadedFile.CreatedBy,
            DownloadUrl = $"/api/files/{uploadedFile.Id}/download"
        };
    }
}
