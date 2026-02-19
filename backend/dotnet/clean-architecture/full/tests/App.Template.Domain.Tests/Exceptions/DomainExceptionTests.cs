using AppTemplate.Domain.Exceptions;

namespace AppTemplate.Domain.Tests.Exceptions;

public class DomainExceptionTests
{
    [Fact]
    public void NotFoundException_ShouldContainEntityNameAndId()
    {
        // Arrange & Act
        var exception = new NotFoundException("User", 123);

        // Assert
        Assert.Equal("NOT_FOUND", exception.ErrorCode);
        Assert.Equal("User", exception.EntityName);
        Assert.Equal(123, exception.EntityId);
        Assert.Contains("User", exception.Message);
        Assert.Contains("123", exception.Message);
    }

    [Fact]
    public void NotFoundException_ShouldWorkWithoutId()
    {
        // Arrange & Act
        var exception = new NotFoundException("Department");

        // Assert
        Assert.Equal("NOT_FOUND", exception.ErrorCode);
        Assert.Equal("Department", exception.EntityName);
        Assert.Null(exception.EntityId);
        Assert.Contains("Department", exception.Message);
    }

    [Fact]
    public void ConflictException_ShouldContainConflictField()
    {
        // Arrange & Act
        var exception = new ConflictException("Username", "Username already exists");

        // Assert
        Assert.Equal("CONFLICT", exception.ErrorCode);
        Assert.Equal("Username", exception.ConflictField);
        Assert.Equal("Username already exists", exception.Message);
    }

    [Fact]
    public void BusinessRuleException_ShouldContainCustomErrorCode()
    {
        // Arrange & Act
        var exception = new BusinessRuleException("INVALID_STATUS_TRANSITION", "Cannot change status from Active to Pending");

        // Assert
        Assert.Equal("INVALID_STATUS_TRANSITION", exception.ErrorCode);
        Assert.Equal("Cannot change status from Active to Pending", exception.Message);
    }

    [Fact]
    public void AuthenticationException_ShouldHaveDefaultMessage()
    {
        // Arrange & Act
        var exception = new AuthenticationException();

        // Assert
        Assert.Equal("AUTHENTICATION_FAILED", exception.ErrorCode);
        Assert.Equal("Authentication failed", exception.Message);
    }

    [Fact]
    public void AuthenticationException_ShouldAcceptCustomMessage()
    {
        // Arrange & Act
        var exception = new AuthenticationException("Invalid credentials");

        // Assert
        Assert.Equal("AUTHENTICATION_FAILED", exception.ErrorCode);
        Assert.Equal("Invalid credentials", exception.Message);
    }

    [Fact]
    public void ForbiddenException_ShouldHaveDefaultMessage()
    {
        // Arrange & Act
        var exception = new ForbiddenException();

        // Assert
        Assert.Equal("FORBIDDEN", exception.ErrorCode);
        Assert.Contains("permission", exception.Message);
    }

    [Fact]
    public void ForbiddenException_ShouldAcceptCustomMessage()
    {
        // Arrange & Act
        var exception = new ForbiddenException("Admin access required");

        // Assert
        Assert.Equal("FORBIDDEN", exception.ErrorCode);
        Assert.Equal("Admin access required", exception.Message);
    }
}
