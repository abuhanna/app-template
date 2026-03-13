using System.Security.Claims;
using App.Template.Api.Common.Models;
using App.Template.Api.Features.Auth;
using App.Template.Api.Features.Auth.Dtos;
using App.Template.Api.Features.Users.Dtos;
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

    private void SetUserClaims(string userId = "1", string role = "admin")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "admin"),
            new Claim(ClaimTypes.Email, "admin@test.com"),
            new Claim(ClaimTypes.Role, role),
            new Claim("firstName", "Admin"),
            new Claim("lastName", "User"),
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
            AccessToken = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresIn = 3600
        };
        _mockAuthService.Setup(s => s.LoginAsync(request)).ReturnsAsync(response);

        var result = await _controller.Login(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<LoginResponse>>(okResult.Value);
        Assert.True(value.Success);
        Assert.Equal("jwt-token", value.Data!.AccessToken);
    }

    [Fact]
    public async Task Register_ReturnsCreated_WithUserDto()
    {
        var request = new RegisterRequest { Username = "newuser", Email = "new@test.com", Password = "Pass@123" };
        var user = new UserDto { Id = 1, Username = "newuser", Email = "new@test.com" };
        _mockAuthService.Setup(s => s.RegisterAsync(request)).ReturnsAsync(user);

        var result = await _controller.Register(request);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(201, objectResult.StatusCode);
        var value = Assert.IsType<ApiResponse<UserDto>>(objectResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task Refresh_ReturnsOk_WithNewTokens()
    {
        var request = new RefreshTokenRequest { RefreshToken = "old-token" };
        var response = new RefreshResponse { AccessToken = "new-token", RefreshToken = "new-refresh" };
        _mockAuthService.Setup(s => s.RefreshTokenAsync(request)).ReturnsAsync(response);

        var result = await _controller.Refresh(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<RefreshResponse>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task Logout_ReturnsNoContent()
    {
        _mockAuthService.Setup(s => s.LogoutAsync()).Returns(Task.CompletedTask);

        var result = await _controller.Logout();

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public void GetCurrentUser_ReturnsOk_WithUserInfo()
    {
        SetUserClaims();

        var result = _controller.GetCurrentUser();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var value = Assert.IsType<ApiResponse<UserInfoDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetProfile_ReturnsOk_WithUserDto()
    {
        SetUserClaims();
        var profile = new UserDto { Id = 1, Username = "admin", Email = "admin@test.com" };
        _mockAuthService.Setup(s => s.GetProfileAsync("1")).ReturnsAsync(profile);

        var result = await _controller.GetProfile();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(value.Success);
        Assert.Equal("admin", value.Data!.Username);
    }

    [Fact]
    public async Task UpdateProfile_ReturnsOk_WithUpdatedProfile()
    {
        SetUserClaims();
        var request = new UpdateProfileRequest { FirstName = "Updated" };
        var profile = new UserDto { Id = 1, Username = "admin" };
        _mockAuthService.Setup(s => s.UpdateProfileAsync("1", request)).ReturnsAsync(profile);

        var result = await _controller.UpdateProfile(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task ChangePassword_ReturnsOk()
    {
        SetUserClaims();
        var request = new ChangePasswordRequest { CurrentPassword = "Old@123", NewPassword = "New@1234", ConfirmPassword = "New@1234" };
        _mockAuthService.Setup(s => s.ChangePasswordAsync("1", request)).Returns(Task.CompletedTask);

        var result = await _controller.ChangePassword(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task ForgotPassword_ReturnsOk_Always()
    {
        var request = new ForgotPasswordRequest { Email = "admin@test.com" };
        _mockAuthService.Setup(s => s.ForgotPasswordAsync(request)).Returns(Task.CompletedTask);

        var result = await _controller.ForgotPassword(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task ResetPassword_ReturnsOk_WhenSuccessful()
    {
        var request = new ResetPasswordRequest { Token = "reset-token", NewPassword = "New@1234", ConfirmPassword = "New@1234" };
        _mockAuthService.Setup(s => s.ResetPasswordAsync(request)).Returns(Task.CompletedTask);

        var result = await _controller.ResetPassword(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(value.Success);
    }
}
