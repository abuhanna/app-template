using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;

namespace App.Template.Api.Repositories;

public interface IAuditLogRepository
{
    Task<PagedResult<AuditLogDto>> GetPagedAsync(
        int page, int pageSize,
        string? sortBy, string sortOrder,
        string? search, string? entityType,
        string? entityId, string? userId,
        string? action, DateTime? fromDate,
        DateTime? toDate, CancellationToken ct = default);

    Task<AuditLogDto?> GetByIdAsync(long id, CancellationToken ct = default);
}
