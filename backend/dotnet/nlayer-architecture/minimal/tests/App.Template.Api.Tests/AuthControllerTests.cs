using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
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
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkObjectResult()
    {
        var loginRequest = new LoginRequest
        {
            Username = "admin",
            Password = "Admin@123"
        };
        var expectedResponse = new LoginResponseDto
        {
            AccessToken = "fake-jwt-token",
            ExpiresIn = 3600,
            User = new UserInfoDto
            {
                Id = "1",
                Username = "admin",
                Email = "admin@apptemplate.local",
                Role = "Admin",
                FullName = "admin"
            }
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Login(loginRequest, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnValue = Assert.IsType<ApiResponse<LoginResponseDto>>(okResult.Value);
        Assert.Equal("fake-jwt-token", returnValue.Data!.AccessToken);
        Assert.Equal(3600, returnValue.Data.ExpiresIn);
        Assert.NotNull(returnValue.Data.User);
        Assert.Equal("admin", returnValue.Data.User.Username);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorizedResult()
    {
        var loginRequest = new LoginRequest
        {
            Username = "wronguser",
            Password = "wrongpassword"
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid username or password"));

        var result = await _controller.Login(loginRequest, CancellationToken.None);

        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }

    [Fact]
    public async Task Login_WhenSsoServiceUnavailable_ReturnsServiceUnavailable()
    {
        var loginRequest = new LoginRequest
        {
            Username = "admin",
            Password = "Admin@123"
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(loginRequest.Username, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Authentication service is currently unavailable"));

        var result = await _controller.Login(loginRequest, CancellationToken.None);

        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, statusResult.StatusCode);
    }

    [Fact]
    public async Task Login_WithNullUsername_PassesEmptyStringToService()
    {
        var loginRequest = new LoginRequest
        {
            Username = null,
            Password = "Admin@123"
        };
        var expectedResponse = new LoginResponseDto
        {
            AccessToken = "fake-jwt-token",
            ExpiresIn = 3600
        };

        _mockSsoAuthService
            .Setup(s => s.LoginAsync(string.Empty, loginRequest.Password, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Login(loginRequest, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        _mockSsoAuthService.Verify(
            s => s.LoginAsync(string.Empty, loginRequest.Password, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Logout_ReturnsNoContent()
    {
        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.Logout(CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Logout_WhenExceptionOccurs_ReturnsInternalServerError()
    {
        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Unexpected error"));

        var result = await _controller.Logout(CancellationToken.None);

        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, statusResult.StatusCode);
    }

    [Fact]
    public async Task Logout_PassesAuthorizationHeaderToService()
    {
        var bearerToken = "Bearer fake-jwt-token";
        _controller.HttpContext.Request.Headers["Authorization"] = bearerToken;

        _mockSsoAuthService
            .Setup(s => s.LogoutAsync(bearerToken, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.Logout(CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
        _mockSsoAuthService.Verify(
            s => s.LogoutAsync(bearerToken, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
