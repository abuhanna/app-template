using App.Template.Api.Models.Entities;

namespace App.Template.Api.Repositories;

public interface IUserRepository
{
    IQueryable<User> GetQueryable();
    Task<User?> GetByIdAsync(long id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByPasswordResetTokenAsync(string token);
    Task<User> AddAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(long id);
}
