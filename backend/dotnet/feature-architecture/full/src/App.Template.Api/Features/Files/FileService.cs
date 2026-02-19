using App.Template.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Files;

public interface IFileService
{
    Task<UploadedFile> UploadFileAsync(IFormFile file);
    Task<(Stream Stream, string ContentType, string FileName)?> GetFileAsync(int id);
}

public class FileService : IFileService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private const string UploadFolder = "uploads";

    public FileService(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<UploadedFile> UploadFileAsync(IFormFile file)
    {
        var uploadPath = Path.Combine(_environment.ContentRootPath, UploadFolder);
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var storedFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadPath, storedFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var uploadedFile = new UploadedFile
        {
            FileName = file.FileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            FilePath = filePath
        };

        _context.Set<UploadedFile>().Add(uploadedFile);
        await _context.SaveChangesAsync();

        return uploadedFile;
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> GetFileAsync(int id)
    {
        var fileRecord = await _context.Set<UploadedFile>().FindAsync(id);
        if (fileRecord == null || !File.Exists(fileRecord.FilePath))
            return null;

        var stream = new FileStream(fileRecord.FilePath!, FileMode.Open, FileAccess.Read);
        return (stream, fileRecord.ContentType, fileRecord.FileName);
    }
}
