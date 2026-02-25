using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.IdentityModel.Tokens;

namespace App.Template.Api.Common.Services;

public interface IJwtTokenGenerator
{
    (string? userId, string? username) ValidateToken(string token);
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly SymmetricSecurityKey _signingKey;
    private readonly string _issuer;
    private readonly string _audience;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");
        _signingKey = ResolveSigningKey(secret);
        _issuer = configuration["Jwt:Issuer"] ?? "AppTemplate";
        _audience = configuration["Jwt:Audience"] ?? "AppTemplate";
    }

    public (string? userId, string? username) ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateIssuer = false,
                ValidIssuer = _issuer,
                ValidateAudience = false,
                ValidAudience = _audience,
                ClockSkew = TimeSpan.Zero
            }, out _);

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = principal.FindFirst(ClaimTypes.Name)?.Value;

            return (userId, username);
        }
        catch (Exception)
        {
            return (null, null);
        }
    }

    /// <summary>
    /// Resolves the JWT secret into a SymmetricSecurityKey.
    /// Auto-detects whether the secret is Base64-encoded or a plain UTF-8 string.
    /// This ensures compatibility with SSO systems (Base64) and simple dev setups (plain strings).
    /// </summary>
    public static SymmetricSecurityKey ResolveSigningKey(string secret)
    {
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
}
