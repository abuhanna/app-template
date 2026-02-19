namespace AppTemplate.Application.Interfaces;

public interface IFileStorageService
{
    Task<(string FileName, string StoragePath)> SaveFileAsync(Stream fileStream, string originalFileName, string contentType, CancellationToken cancellationToken = default);
    Task<Stream?> GetFileAsync(string storagePath, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string storagePath, CancellationToken cancellationToken = default);
    bool FileExists(string storagePath);
}
