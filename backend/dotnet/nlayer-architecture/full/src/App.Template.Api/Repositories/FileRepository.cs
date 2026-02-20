using App.Template.Api.Data;
using App.Template.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Repositories;

public class FileRepository : IFileRepository
{
    private readonly AppDbContext _context;

    public FileRepository(AppDbContext context)
    {
        _context = context;
    }

    public IQueryable<UploadedFile> GetQueryable() => _context.UploadedFiles.AsQueryable();

    public async Task<UploadedFile?> GetByIdAsync(long id)
        => await _context.UploadedFiles.FindAsync(id);

    public async Task<UploadedFile> AddAsync(UploadedFile file)
    {
        _context.UploadedFiles.Add(file);
        await _context.SaveChangesAsync();
        return file;
    }

    public async Task DeleteAsync(UploadedFile file)
    {
        _context.UploadedFiles.Remove(file);
        await _context.SaveChangesAsync();
    }
}
