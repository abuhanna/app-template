using System.Security.Claims;
using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Features.Authentication.Commands.Login;
using AppTemplate.Application.Features.Authentication.Commands.Logout;
using AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _controller = new AuthController(_mockMediator.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task Login_ReturnsOk_WhenCredentialsAreValid()
    {
        var command = new LoginCommand { Username = "admin", Password = "Admin@123" };
        var expectedResponse = new LoginResponseDto
        {
            AccessToken = "jwt-token",
            ExpiresIn = 3600
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Login(command);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LoginResponseDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("jwt-token", response.Data!.AccessToken);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
    {
        var command = new LoginCommand { Username = "admin", Password = "wrong" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        var result = await _controller.Login(command);

        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    [Fact]
    public async Task Login_Returns503_WhenServiceUnavailable()
    {
        var command = new LoginCommand { Username = "admin", Password = "Admin@123" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("SSO unavailable"));

        var result = await _controller.Login(command);

        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
    }

    [Fact]
    public async Task Logout_ReturnsNoContent_WhenSuccessful()
    {
        _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer some-token";

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LogoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.Logout();

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Logout_Returns500_WhenExceptionOccurs()
    {
        _mockMediator
            .Setup(m => m.Send(It.IsAny<LogoutCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Something went wrong"));

        var result = await _controller.Logout();

        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUser_ReturnsOk_WithUserInfo()
    {
        var claims = new[] { new Claim("sub", "1"), new Claim(ClaimTypes.Role, "Admin") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);

        var expectedResponse = new UserInfoResponseDto
        {
            UserId = "1",
            Username = "admin",
            Role = "Admin"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetCurrentUserQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.GetCurrentUser();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserInfoResponseDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("1", response.Data!.UserId);
    }
}
