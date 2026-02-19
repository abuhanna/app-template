using AppTemplate.Application.Features.Authentication.Commands.Login;
using FluentValidation.TestHelper;

namespace AppTemplate.Application.Tests.Features.Authentication.Commands;

public class LoginCommandValidatorTests
{
    private readonly LoginCommandValidator _validator;

    public LoginCommandValidatorTests()
    {
        _validator = new LoginCommandValidator();
    }

    [Fact]
    public void Should_Pass_When_Valid_Credentials()
    {
        // Arrange
        var command = new LoginCommand
        {
            Username = "testuser",
            Password = "Password123"
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
        var command = new LoginCommand
        {
            Username = "",
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username is required");
    }

    [Fact]
    public void Should_Fail_When_Password_Is_Empty()
    {
        // Arrange
        var command = new LoginCommand
        {
            Username = "testuser",
            Password = ""
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password is required");
    }

    [Fact]
    public void Should_Fail_When_Username_Exceeds_Max_Length()
    {
        // Arrange
        var command = new LoginCommand
        {
            Username = new string('a', 51),
            Password = "Password123"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username cannot exceed 50 characters");
    }

    [Fact]
    public void Should_Fail_When_Both_Fields_Are_Empty()
    {
        // Arrange
        var command = new LoginCommand
        {
            Username = "",
            Password = ""
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Username);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
