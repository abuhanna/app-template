using System.Net;
using System.Text.Json;

namespace App.Template.Api.Middleware;

/// <summary>
/// Global exception handler middleware that catches all unhandled exceptions
/// and returns standardized error responses.
/// </summary>
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlerMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString();
        var requestPath = context.Request.Path.Value;
        var requestMethod = context.Request.Method;
        var userId = context.User?.FindFirst("sub")?.Value ?? "anonymous";

        var response = context.Response;
        response.ContentType = "application/json";

        object errorResponse;

        switch (exception)
        {
            case UnauthorizedAccessException unauthorizedException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = new
                {
                    code = "UNAUTHORIZED",
                    message = unauthorizedException.Message,
                    correlationId
                };
                _logger.LogWarning(
                    "[{Method} {Path}] Unauthorized: {Message}",
                    requestMethod, requestPath, unauthorizedException.Message);
                break;

            case InvalidOperationException invalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    code = "BAD_REQUEST",
                    message = invalidOperationException.Message,
                    correlationId
                };
                _logger.LogWarning(
                    "[{Method} {Path}] Invalid operation: {Message} | User: {UserId}",
                    requestMethod, requestPath, invalidOperationException.Message, userId);
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;

                _logger.LogError(
                    "[{Method} {Path}] UNHANDLED {ExceptionType}: {Message} | " +
                    "Source: {Source} | User: {UserId} | Inner: {InnerMessage}",
                    requestMethod, requestPath,
                    exception.GetType().Name,
                    exception.Message,
                    exception.Source ?? "Unknown",
                    userId,
                    exception.InnerException?.Message ?? "None");

                if (_environment.IsDevelopment() || _environment.IsStaging())
                {
                    errorResponse = new
                    {
                        code = "INTERNAL_ERROR",
                        message = exception.Message,
                        detail = exception.InnerException?.Message,
                        stackTrace = exception.StackTrace,
                        correlationId
                    };
                }
                else
                {
                    errorResponse = new
                    {
                        code = "INTERNAL_ERROR",
                        message = "An unexpected error occurred. Please try again later.",
                        correlationId
                    };
                }
                break;
        }

        var result = JsonSerializer.Serialize(errorResponse, JsonOptions);
        await response.WriteAsync(result);
    }
}
