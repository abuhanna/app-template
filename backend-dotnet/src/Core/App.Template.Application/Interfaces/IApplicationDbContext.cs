using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using AppTemplate.Domain.Entities;

namespace AppTemplate.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Department> Departments { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<UploadedFile> UploadedFiles { get; }
    DbSet<AuditLog> AuditLogs { get; }

    /// <summary>
    /// Database facade for accessing database-level operations like CanConnectAsync
    /// </summary>
    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
