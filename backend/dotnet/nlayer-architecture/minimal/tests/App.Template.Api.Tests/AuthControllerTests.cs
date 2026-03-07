using App.Template.Api.Controllers;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class AuthControllerTests
{
    private readonly Mock<ISsoAuthService> _mockSsoAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockSsoAuthService = new Mock<ISsoAuthService>();
        _controller = new AuthController(_mockSsoAuthService.Object);

        // Set up a default HttpContext so Request.Headers is available
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkObjectResult()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "admin",
            Password = "Admin@123"
        };
        var expectedResponse = new LoginResponseDto
        {
            Token = "fake-jwt-token",
            ExpiresIn = 3600,
            User = new UserInfoDto
            {
                Id = "1",
                Username = "admin",
                Email = "admin@apptemplate.local",
                Role = "Admin",
                Name = "admin"
            }
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(loginRequest, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<LoginResponseDto>(okResult.Value);
        Assert.Equal("fake-jwt-token", returnValue.Token);
        Assert.Equal(3600, returnValue.ExpiresIn);
        Assert.NotNull(returnValue.User);
        Assert.Equal("admin", returnValue.User.Username);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorizedResult()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "wronguser",
            Password = "wrongpassword"
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid username or password"));

        // Act
        var result = await _controller.Login(loginRequest, CancellationToken.None);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }

    [Fact]
    public async Task Login_WhenSsoServiceUnavailable_ReturnsServiceUnavailable()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "admin",
            Password = "Admin@123"
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Authentication service is currently unavailable"));

        // Act
        var result = await _controller.Login(loginRequest, CancellationToken.None);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, statusResult.StatusCode);
    }

    [Fact]
    public async Task Login_WithNullUsername_PassesEmptyStringToService()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = null,
            Password = "Admin@123"
        };
        var expectedResponse = new LoginResponseDto
        {
            Token = "fake-jwt-token",
            ExpiresIn = 3600
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(string.Empty, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(loginRequest, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        _mockSsoAuthService.Verify(
            s => s.LoginAsync(string.Empty, loginRequest.Password, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Logout_ReturnsOkObjectResult()
    {
        // Arrange
        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Logout(CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Logout_WhenExceptionOccurs_ReturnsInternalServerError()
    {
        // Arrange
        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Unexpected error"));

        // Act
        var result = await _controller.Logout(CancellationToken.None);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, statusResult.StatusCode);
    }

    [Fact]
    public async Task Logout_PassesAuthorizationHeaderToService()
    {
        // Arrange
        var bearerToken = "Bearer fake-jwt-token";
        _controller.HttpContext.Request.Headers["Authorization"] = bearerToken;

        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(bearerToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Logout(CancellationToken.None);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockSsoAuthService.Verify(
            s => s.LogoutAsync(bearerToken, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
