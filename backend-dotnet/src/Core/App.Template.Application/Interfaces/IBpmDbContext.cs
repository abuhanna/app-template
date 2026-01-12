using Microsoft.EntityFrameworkCore;
using AppTemplate.Domain.Entities;

namespace AppTemplate.Application.Interfaces;

public interface IBpmDbContext
{
    DbSet<User> Users { get; }
    DbSet<Department> Departments { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
