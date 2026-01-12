namespace AppTemplate.Domain.Exceptions;

/// <summary>
/// Base exception for all domain-specific errors.
/// </summary>
public abstract class DomainException : Exception
{
    /// <summary>
    /// Machine-readable error code for programmatic handling.
    /// </summary>
    public string ErrorCode { get; }

    protected DomainException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }

    protected DomainException(string errorCode, string message, Exception innerException)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}

/// <summary>
/// Thrown when a requested entity is not found.
/// </summary>
public class NotFoundException : DomainException
{
    public string EntityName { get; }
    public object? EntityId { get; }

    public NotFoundException(string entityName, object? entityId = null)
        : base("NOT_FOUND", $"{entityName} was not found" + (entityId != null ? $" (ID: {entityId})" : ""))
    {
        EntityName = entityName;
        EntityId = entityId;
    }
}

/// <summary>
/// Thrown when a business rule is violated.
/// </summary>
public class BusinessRuleException : DomainException
{
    public BusinessRuleException(string errorCode, string message)
        : base(errorCode, message)
    {
    }
}

/// <summary>
/// Thrown when there's a conflict with existing data (e.g., duplicate username).
/// </summary>
public class ConflictException : DomainException
{
    public string ConflictField { get; }

    public ConflictException(string conflictField, string message)
        : base("CONFLICT", message)
    {
        ConflictField = conflictField;
    }
}

/// <summary>
/// Thrown when authentication fails.
/// </summary>
public class AuthenticationException : DomainException
{
    public AuthenticationException(string message = "Authentication failed")
        : base("AUTHENTICATION_FAILED", message)
    {
    }
}

/// <summary>
/// Thrown when authorization fails (user doesn't have permission).
/// </summary>
public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "You don't have permission to perform this action")
        : base("FORBIDDEN", message)
    {
    }
}
