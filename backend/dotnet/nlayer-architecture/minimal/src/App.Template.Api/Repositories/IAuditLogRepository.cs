using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;

namespace App.Template.Api.Repositories;

public interface IAuditLogRepository
{
    Task<PagedResult<AuditLogDto>> GetPagedAsync(
        int page, int pageSize,
        string? sortBy, string sortDir,
        string? search, string? entityName,
        string? entityId, string? userId,
        string? action, DateTime? fromDate,
        DateTime? toDate, CancellationToken ct = default);
}
