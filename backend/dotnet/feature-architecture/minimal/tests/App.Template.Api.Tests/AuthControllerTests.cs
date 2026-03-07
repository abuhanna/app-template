using App.Template.Api.Features.Auth;
using App.Template.Api.Features.Auth.Dtos;
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

        // Set up a default HttpContext so Request.Headers is available (needed by Logout)
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkResult()
    {
        // Arrange
        var request = new LoginRequest { Username = "admin", Password = "Admin@123" };
        var expectedResponse = new LoginResponseDto
        {
            Token = "fake-jwt-token",
            ExpiresIn = 3600,
            User = new UserInfoDto
            {
                Id = "1",
                Username = "admin",
                Email = "admin@apptemplate.com",
                Role = "Admin"
            }
        };
        _mockSsoAuthService
            .Setup(s => s.LoginAsync("admin", "Admin@123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        var response = Assert.IsType<LoginResponseDto>(okResult.Value);
        Assert.Equal("fake-jwt-token", response.Token);
        Assert.Equal(3600, response.ExpiresIn);
        Assert.Equal("admin", response.User?.Username);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest { Username = "admin", Password = "wrong-password" };
        _mockSsoAuthService
            .Setup(s => s.LoginAsync("admin", "wrong-password", It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid username or password"));

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }

    [Fact]
    public async Task Login_WhenServiceUnavailable_ReturnsServiceUnavailable()
    {
        // Arrange
        var request = new LoginRequest { Username = "admin", Password = "Admin@123" };
        _mockSsoAuthService
            .Setup(s => s.LoginAsync("admin", "Admin@123", It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Authentication service is currently unavailable"));

        // Act
        var result = await _controller.Login(request);

        // Assert
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, statusResult.StatusCode);
    }

    [Fact]
    public async Task Logout_ReturnsOkResult()
    {
        // Arrange
        _controller.HttpContext.Request.Headers["Authorization"] = "Bearer fake-jwt-token";
        _mockSsoAuthService
            .Setup(s => s.LogoutAsync("Bearer fake-jwt-token", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Logout();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
