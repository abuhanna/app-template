using System.Net;
using System.Text.Json;
using AppTemplate.Application.Common.Models;
using AppTemplate.Domain.Exceptions;
using FluentValidation;

namespace AppTemplate.WebAPI.Middleware;

/// <summary>
/// Global exception handler middleware that catches all unhandled exceptions
/// and returns standardized error responses using ApiResponse format.
/// </summary>
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
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
        var requestPath = context.Request.Path.Value;
        var requestMethod = context.Request.Method;
        var userId = context.User?.FindFirst("sub")?.Value ?? "anonymous";

        var response = context.Response;
        response.ContentType = "application/json";

        ApiResponse errorResponse;

        switch (exception)
        {
            // Domain Exceptions - Expected errors, log as Warning
            case NotFoundException notFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse = ApiResponse.Fail(notFoundException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Not found: {Entity} (ID: {EntityId}) | User: {UserId}",
                    requestMethod, requestPath, notFoundException.EntityName,
                    notFoundException.EntityId, userId);
                break;

            case ConflictException conflictException:
                response.StatusCode = (int)HttpStatusCode.Conflict;
                errorResponse = ApiResponse.Fail(conflictException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Conflict on field '{Field}': {Message} | User: {UserId}",
                    requestMethod, requestPath, conflictException.ConflictField,
                    conflictException.Message, userId);
                break;

            case AuthenticationException authException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = ApiResponse.Fail(authException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Authentication failed: {Message}",
                    requestMethod, requestPath, authException.Message);
                break;

            case ForbiddenException forbiddenException:
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                errorResponse = ApiResponse.Fail(forbiddenException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Access denied: {Message} | User: {UserId}",
                    requestMethod, requestPath, forbiddenException.Message, userId);
                break;

            case BusinessRuleException businessException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = ApiResponse.Fail(businessException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Business rule [{Code}]: {Message} | User: {UserId}",
                    requestMethod, requestPath, businessException.ErrorCode,
                    businessException.Message, userId);
                break;

            case ValidationException validationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                var validationErrors = validationException.Errors
                    .Select(e => $"{e.PropertyName}: {e.ErrorMessage}")
                    .ToList();
                errorResponse = ApiResponse.Fail(
                    "One or more validation errors occurred",
                    validationErrors);
                var errorSummary = string.Join("; ", validationException.Errors
                    .Take(3)
                    .Select(e => $"{e.PropertyName}: {e.ErrorMessage}"));
                if (validationException.Errors.Count() > 3)
                    errorSummary += $" (+{validationException.Errors.Count() - 3} more)";
                _logger.LogWarning(
                    "[{Method} {Path}] Validation failed: {Errors} | User: {UserId}",
                    requestMethod, requestPath, errorSummary, userId);
                break;

            case InvalidOperationException invalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = ApiResponse.Fail(invalidOperationException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Invalid operation: {Message} | User: {UserId}",
                    requestMethod, requestPath, invalidOperationException.Message, userId);
                break;

            case UnauthorizedAccessException unauthorizedException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = ApiResponse.Fail(unauthorizedException.Message);
                _logger.LogWarning(
                    "[{Method} {Path}] Unauthorized: {Message}",
                    requestMethod, requestPath, unauthorizedException.Message);
                break;

            // Unhandled exceptions - Log as Error with structured context
            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;

                // Log concise, structured error information
                _logger.LogError(
                    "[{Method} {Path}] UNHANDLED {ExceptionType}: {Message} | " +
                    "Source: {Source} | User: {UserId} | " +
                    "Inner: {InnerMessage}",
                    requestMethod,
                    requestPath,
                    exception.GetType().Name,
                    exception.Message,
                    exception.Source ?? "Unknown",
                    userId,
                    exception.InnerException?.Message ?? "None");

                // Show detailed error in Development/Staging only
                if (_environment.IsDevelopment() || _environment.IsStaging())
                {
                    errorResponse = ApiResponse.Fail(
                        exception.Message,
                        new List<string>
                        {
                            exception.InnerException?.Message ?? "",
                            exception.StackTrace ?? ""
                        }.Where(s => !string.IsNullOrEmpty(s)).ToList());
                }
                else
                {
                    errorResponse = ApiResponse.Fail(
                        "An unexpected error occurred. Please try again later.");
                }
                break;
        }

        var result = JsonSerializer.Serialize(errorResponse, JsonOptions);
        await response.WriteAsync(result);
    }
}
