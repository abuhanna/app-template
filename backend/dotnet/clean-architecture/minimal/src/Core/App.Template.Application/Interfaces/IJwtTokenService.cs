namespace AppTemplate.Application.Interfaces;

public interface IJwtTokenService
{
    (string? userId, string? username) ValidateToken(string token);
}
