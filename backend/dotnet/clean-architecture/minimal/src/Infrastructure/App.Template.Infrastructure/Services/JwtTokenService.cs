using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AppTemplate.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Resolves the JWT secret into a SymmetricSecurityKey.
    /// Auto-detects whether the secret is Base64-encoded or a plain UTF-8 string.
    /// This ensures compatibility with SSO systems (Base64) and simple dev setups (plain strings).
    /// </summary>
    public static SymmetricSecurityKey ResolveSigningKey(string secret)
    {
        // Try Base64 first: if it looks like valid Base64 and decodes to enough bytes, use it
        try
        {
            var bytes = Convert.FromBase64String(secret);
            if (bytes.Length >= 16) // At least 128-bit key
            {
                return new SymmetricSecurityKey(bytes);
            }
        }
        catch (FormatException)
        {
            // Not valid Base64, fall through to UTF-8
        }

        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string GenerateToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var issuer = _configuration["Jwt:Issuer"] ?? "AppTemplate";
        var audience = _configuration["Jwt:Audience"] ?? "AppTemplate.Users";
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        var key = ResolveSigningKey(secret);
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role ?? "User"),
            new("name", user.Name ?? user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (long? userId, string? username) ValidateToken(string token)
    {
        try
        {
            var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
            var issuer = _configuration["Jwt:Issuer"] ?? "AppTemplate";
            var audience = _configuration["Jwt:Audience"] ?? "AppTemplate.Users";

            var key = ResolveSigningKey(secret);
            var tokenHandler = new JwtSecurityTokenHandler();

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var usernameClaim = principal.FindFirst(ClaimTypes.Name)?.Value;

            if (long.TryParse(userIdClaim, out var userId))
            {
                return (userId, usernameClaim);
            }

            return (null, null);
        }
        catch
        {
            return (null, null);
        }
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public int GetRefreshTokenExpirationDays()
    {
        return int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
    }
}
