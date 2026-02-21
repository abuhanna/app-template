using System.Text;

using Microsoft.IdentityModel.Tokens;

namespace App.Template.Api.Common.Infrastructure;

public static class JwtSigningKeyResolver
{
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
}
