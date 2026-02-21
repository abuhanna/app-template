using System.Diagnostics;

namespace App.Template.Api.Middleware;

/// <summary>
/// Middleware that logs HTTP request information including method, path, status code, and duration.
/// Sensitive paths (like authentication) have reduced logging to prevent credential exposure.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    private static readonly HashSet<string> SensitivePaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/login",
        "/api/auth/refresh"
    };

    private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/health",
        "/favicon.ico"
    };

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "";

        if (ExcludedPaths.Contains(path))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var method = context.Request.Method;
        var queryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : "";

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var statusCode = context.Response.StatusCode;
            var duration = stopwatch.ElapsedMilliseconds;
            var userId = context.User?.FindFirst("sub")?.Value ?? "anonymous";

            var logLevel = statusCode switch
            {
                >= 500 => LogLevel.Error,
                >= 400 => LogLevel.Warning,
                _ => LogLevel.Information
            };

            if (SensitivePaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.Log(logLevel,
                    "HTTP {Method} {Path} responded {StatusCode} in {Duration}ms [User: {UserId}]",
                    method, path, statusCode, duration, userId);
            }
            else
            {
                _logger.Log(logLevel,
                    "HTTP {Method} {Path}{QueryString} responded {StatusCode} in {Duration}ms [User: {UserId}]",
                    method, path, queryString, statusCode, duration, userId);
            }
        }
    }
}

public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}
