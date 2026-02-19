namespace AppTemplate.WebAPI.Configuration;

/// <summary>
/// Validates required environment variables and configuration on application startup.
/// </summary>
public static class EnvironmentValidator
{
    /// <summary>
    /// Validates all required configuration settings.
    /// Throws InvalidOperationException if any required settings are missing or invalid.
    /// </summary>
    public static void Validate(IConfiguration configuration)
    {
        var errors = new List<string>();

        // Required connection string
        ValidateRequired(configuration, "ConnectionStrings:DefaultConnection", errors);

        // Required JWT settings
        ValidateRequired(configuration, "Jwt:Secret", errors);
        ValidateRequired(configuration, "Jwt:Issuer", errors);
        ValidateRequired(configuration, "Jwt:Audience", errors);

        // JWT Secret minimum length validation
        var jwtSecret = configuration["Jwt:Secret"];
        if (!string.IsNullOrEmpty(jwtSecret) && jwtSecret.Length < 32)
        {
            errors.Add("Jwt:Secret must be at least 32 characters long");
        }

        // Throw if any validation errors
        if (errors.Count > 0)
        {
            var errorMessage = string.Join("\n", errors.Select(e => $"  - {e}"));
            throw new InvalidOperationException(
                $"Environment validation failed:\n{errorMessage}\n\nPlease check your appsettings.json or environment variables.");
        }
    }

    private static void ValidateRequired(IConfiguration configuration, string key, List<string> errors)
    {
        var value = configuration[key];
        if (string.IsNullOrEmpty(value))
        {
            errors.Add($"Missing required configuration: {key}");
        }
    }
}
