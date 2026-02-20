using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken token);
    Task UpdateAsync(RefreshToken token);
    Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(long userId);
}
