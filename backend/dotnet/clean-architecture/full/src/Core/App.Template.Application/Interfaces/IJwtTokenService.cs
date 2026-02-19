using AppTemplate.Domain.Entities;

namespace AppTemplate.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    (long? userId, string? username) ValidateToken(string token);
    string GenerateRefreshToken();
    int GetRefreshTokenExpirationDays();
}
