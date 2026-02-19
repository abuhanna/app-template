using AppTemplate.Application.Features.UserManagement.Commands.CreateUser;
using FluentValidation.TestHelper;

namespace AppTemplate.Application.Tests.Features.UserManagement.Commands;

public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _validator;

    public CreateUserCommandValidatorTests()
    {
        _validator = new CreateUserCommandValidator();
    }

    [Fact]
    public void Should_Pass_When_Valid_User_Data()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123",
            FirstName = "Test",
            LastName = "User",
            Role = "User",
            DepartmentId = 1
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Username_Is_Empty()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "",
            Email = "test@example.com",
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username is required");
    }

    [Fact]
    public void Should_Fail_When_Username_Too_Short()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "ab",
            Email = "test@example.com",
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username must be at least 3 characters");
    }

    [Fact]
    public void Should_Fail_When_Username_Contains_Invalid_Characters()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "test@user",
            Email = "test@example.com",
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username can only contain letters, numbers, and underscores");
    }

    [Fact]
    public void Should_Fail_When_Email_Is_Invalid()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "invalid-email",
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Invalid email format");
    }

    [Fact]
    public void Should_Fail_When_Password_Too_Short()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Pass1"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must be at least 8 characters");
    }

    [Fact]
    public void Should_Fail_When_Password_Missing_Uppercase()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one uppercase letter");
    }

    [Fact]
    public void Should_Fail_When_Password_Missing_Lowercase()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "PASSWORD123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one lowercase letter");
    }

    [Fact]
    public void Should_Fail_When_Password_Missing_Number()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "PasswordABC"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one number");
    }

    [Fact]
    public void Should_Fail_When_DepartmentId_Is_Zero()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123",
            DepartmentId = 0
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DepartmentId)
            .WithErrorMessage("Department ID must be a positive number");
    }

    [Fact]
    public void Should_Pass_When_Optional_Fields_Are_Null()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123",
            FirstName = null,
            LastName = null,
            Role = null,
            DepartmentId = null
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
