using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IFileRepository
{
    IQueryable<UploadedFile> GetQueryable();
    Task<UploadedFile?> GetByIdAsync(long id);
    Task<UploadedFile> AddAsync(UploadedFile file);
    Task DeleteAsync(UploadedFile file);
}
