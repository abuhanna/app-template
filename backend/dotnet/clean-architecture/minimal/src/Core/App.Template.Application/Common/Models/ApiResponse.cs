using System.Text.Json.Serialization;

namespace AppTemplate.Application.Common.Models;

/// <summary>
/// Standardized API error response format.
/// </summary>
public class ApiErrorResponse
{
    /// <summary>
    /// Indicates if the request was successful.
    /// </summary>
    [JsonPropertyName("success")]
    public bool Success => false;

    /// <summary>
    /// Error details.
    /// </summary>
    [JsonPropertyName("error")]
    public ApiError Error { get; set; } = null!;

    public static ApiErrorResponse Create(string code, string message, string? correlationId = null)
    {
        return new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = code,
                Message = message,
                CorrelationId = correlationId,
                Timestamp = DateTime.UtcNow
            }
        };
    }

    public static ApiErrorResponse CreateValidationError(
        string message,
        Dictionary<string, string[]>? validationErrors = null,
        string? correlationId = null)
    {
        return new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = "VALIDATION_ERROR",
                Message = message,
                ValidationErrors = validationErrors,
                CorrelationId = correlationId,
                Timestamp = DateTime.UtcNow
            }
        };
    }

    public static ApiErrorResponse CreateServerError(
        string message,
        string? details = null,
        string? stackTrace = null,
        string? correlationId = null)
    {
        return new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = "INTERNAL_ERROR",
                Message = message,
                Details = details,
                StackTrace = stackTrace,
                CorrelationId = correlationId,
                Timestamp = DateTime.UtcNow
            }
        };
    }
}

/// <summary>
/// Error details structure.
/// </summary>
public class ApiError
{
    /// <summary>
    /// Machine-readable error code (e.g., "NOT_FOUND", "VALIDATION_ERROR").
    /// </summary>
    [JsonPropertyName("code")]
    public string Code { get; set; } = null!;

    /// <summary>
    /// Human-readable error message.
    /// </summary>
    [JsonPropertyName("message")]
    public string Message { get; set; } = null!;

    /// <summary>
    /// Additional error details (only in development/staging).
    /// </summary>
    [JsonPropertyName("details")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Details { get; set; }

    /// <summary>
    /// Validation errors by field name.
    /// </summary>
    [JsonPropertyName("validationErrors")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    /// <summary>
    /// Stack trace (only in development/staging).
    /// </summary>
    [JsonPropertyName("stackTrace")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? StackTrace { get; set; }

    /// <summary>
    /// Request correlation ID for tracing.
    /// </summary>
    [JsonPropertyName("correlationId")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? CorrelationId { get; set; }

    /// <summary>
    /// Timestamp when the error occurred.
    /// </summary>
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Standardized success response wrapper (optional use).
/// </summary>
/// <typeparam name="T">The data type.</typeparam>
public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success => true;

    [JsonPropertyName("data")]
    public T Data { get; set; } = default!;

    public static ApiResponse<T> Create(T data)
    {
        return new ApiResponse<T> { Data = data };
    }
}
