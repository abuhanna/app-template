using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IAuditLogRepository
{
    IQueryable<AuditLog> GetQueryable();
}
