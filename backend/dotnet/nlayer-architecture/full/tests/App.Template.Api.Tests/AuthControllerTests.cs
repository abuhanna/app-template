using System.Security.Claims;
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
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    private void SetUserClaims(string userId = "1", string role = "Admin")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "admin"),
            new Claim(ClaimTypes.Email, "admin@test.com"),
            new Claim(ClaimTypes.Role, role),
            new Claim("name", "Admin User"),
            new Claim("departmentId", "1"),
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task Login_ReturnsOk_WithLoginResponse()
    {
        var request = new LoginRequest { Username = "admin", Password = "Admin@123" };
        var response = new LoginResponse
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresIn = 3600
        };
        _mockAuthService.Setup(s => s.LoginAsync(request)).ReturnsAsync(response);

        var result = await _controller.Login(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<LoginResponse>(okResult.Value);
        Assert.Equal("jwt-token", value.Token);
    }

    [Fact]
    public async Task Refresh_ReturnsOk_WithNewTokens()
    {
        var request = new RefreshTokenRequest { RefreshToken = "old-token" };
        var response = new LoginResponse { Token = "new-token", RefreshToken = "new-refresh" };
        _mockAuthService.Setup(s => s.RefreshTokenAsync(request)).ReturnsAsync(response);

        var result = await _controller.Refresh(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Logout_ReturnsOk()
    {
        _mockAuthService.Setup(s => s.LogoutAsync()).Returns(Task.CompletedTask);

        var result = await _controller.Logout();

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void GetCurrentUser_ReturnsOk_WithUserInfo()
    {
        SetUserClaims();

        var result = _controller.GetCurrentUser();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetProfile_ReturnsOk_WithUserDto()
    {
        SetUserClaims();
        var profile = new UserDto { Id = 1, Username = "admin", Email = "admin@test.com" };
        _mockAuthService.Setup(s => s.GetProfileAsync("1")).ReturnsAsync(profile);

        var result = await _controller.GetProfile();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal("admin", value.Username);
    }

    [Fact]
    public async Task UpdateProfile_ReturnsOk_WithUpdatedProfile()
    {
        SetUserClaims();
        var request = new UpdateProfileRequest { Name = "Updated Name" };
        var profile = new UserDto { Id = 1, Username = "admin" };
        _mockAuthService.Setup(s => s.UpdateProfileAsync("1", request)).ReturnsAsync(profile);

        var result = await _controller.UpdateProfile(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task ForgotPassword_ReturnsOk_Always()
    {
        var request = new ForgotPasswordRequest { Email = "admin@test.com" };
        _mockAuthService.Setup(s => s.ForgotPasswordAsync(request)).Returns(Task.CompletedTask);

        var result = await _controller.ForgotPassword(request);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task ResetPassword_ReturnsOk_WhenSuccessful()
    {
        var request = new ResetPasswordRequest { Token = "reset-token", NewPassword = "New@123" };
        _mockAuthService.Setup(s => s.ResetPasswordAsync(request)).Returns(Task.CompletedTask);

        var result = await _controller.ResetPassword(request);

        Assert.IsType<OkObjectResult>(result);
    }
}
