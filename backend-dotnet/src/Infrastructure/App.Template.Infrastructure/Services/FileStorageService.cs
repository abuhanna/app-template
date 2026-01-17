using AppTemplate.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _storagePath = configuration["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _logger = logger;

        // Ensure the upload directory exists
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
            _logger.LogInformation("Created upload directory: {Path}", _storagePath);
        }
    }

    public async Task<(string FileName, string StoragePath)> SaveFileAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        // Generate unique filename
        var fileExtension = Path.GetExtension(originalFileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

        // Create year/month subfolder structure
        var subFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var folderPath = Path.Combine(_storagePath, subFolder);

        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var fullPath = Path.Combine(folderPath, uniqueFileName);
        var storagePath = Path.Combine(subFolder, uniqueFileName).Replace("\\", "/");

        await using var fileStreamOut = new FileStream(fullPath, FileMode.Create);
        await fileStream.CopyToAsync(fileStreamOut, cancellationToken);

        _logger.LogInformation("File saved: {FileName} -> {StoragePath}", originalFileName, storagePath);

        return (uniqueFileName, storagePath);
    }

    public async Task<Stream?> GetFileAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_storagePath, storagePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("File not found: {StoragePath}", storagePath);
            return null;
        }

        var memoryStream = new MemoryStream();
        await using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public Task DeleteFileAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_storagePath, storagePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("File deleted: {StoragePath}", storagePath);
        }
        else
        {
            _logger.LogWarning("File not found for deletion: {StoragePath}", storagePath);
        }

        return Task.CompletedTask;
    }

    public bool FileExists(string storagePath)
    {
        var fullPath = Path.Combine(_storagePath, storagePath.Replace("/", Path.DirectorySeparatorChar.ToString()));
        return File.Exists(fullPath);
    }
}
