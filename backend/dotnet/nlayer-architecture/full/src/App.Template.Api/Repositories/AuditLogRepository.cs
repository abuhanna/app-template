using App.Template.Api.Data;
using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AppDbContext _context;

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public IQueryable<AuditLog> GetQueryable() => _context.AuditLogs.AsQueryable();
}
