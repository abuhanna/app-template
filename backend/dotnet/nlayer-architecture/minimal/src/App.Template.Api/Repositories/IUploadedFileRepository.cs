using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IUploadedFileRepository
{
    Task<PagedResult<UploadedFileDto>> GetPagedAsync(string? category, bool? isPublic, int page, int pageSize, CancellationToken ct = default);
    Task<UploadedFile?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<UploadedFile> AddAsync(UploadedFile file, CancellationToken ct = default);
    Task<bool> DeleteAsync(long id, CancellationToken ct = default);
}
