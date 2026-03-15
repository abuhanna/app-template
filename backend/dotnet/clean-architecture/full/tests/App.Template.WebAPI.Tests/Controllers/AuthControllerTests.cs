using System.Security.Claims;
using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Features.Authentication.Commands.Login;
using AppTemplate.Application.Features.Authentication.Commands.Logout;
using AppTemplate.Application.Features.Authentication.Commands.RefreshToken;
using AppTemplate.Application.Features.Authentication.Commands.RequestPasswordReset;
using AppTemplate.Application.Features.Authentication.Commands.ResetPassword;
using AppTemplate.Application.Features.Authentication.Commands.UpdateMyProfile;
using AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;
using AppTemplate.Application.Features.Authentication.Queries.GetMyProfile;
using AppTemplate.Application.Features.UserManagement.Commands.ChangePassword;
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

    #region Login

    [Fact]
    public async Task Login_ReturnsOk_WhenCredentialsAreValid()
    {
        // Arrange
        var command = new LoginCommand { Username = "admin", Password = "Admin@123" };
        var expectedResponse = new LoginResponseDto
        {
            AccessToken = "jwt-token",
            ExpiresIn = 3600,
            RefreshToken = "refresh-token"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<LoginResponseDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("jwt-token", response.Data!.AccessToken);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var command = new LoginCommand { Username = "admin", Password = "wrongpassword" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act
        var result = await _controller.Login(command);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
        var response = Assert.IsType<ApiResponse>(unauthorizedResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public async Task Login_Returns503_WhenServiceUnavailable()
    {
        // Arrange
        var command = new LoginCommand { Username = "admin", Password = "Admin@123" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Invalid username or password"));

        // Act
        var result = await _controller.Login(command);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
        var response = Assert.IsType<ApiResponse>(statusCodeResult.Value);
        Assert.False(response.Success);
    }

    #endregion

    #region RefreshToken

    [Fact]
    public async Task RefreshToken_ReturnsOk_WhenTokenIsValid()
    {
        // Arrange
        var command = new RefreshTokenCommand { RefreshToken = "valid-refresh-token" };
        var expectedResponse = new RefreshResponse
        {
            AccessToken = "new-jwt-token",
            ExpiresIn = 3600,
            RefreshToken = "new-refresh-token"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RefreshTokenCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.RefreshToken(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<RefreshResponse>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("new-jwt-token", response.Data!.AccessToken);
    }

    [Fact]
    public async Task RefreshToken_ReturnsUnauthorized_WhenTokenIsInvalid()
    {
        // Arrange
        var command = new RefreshTokenCommand { RefreshToken = "invalid-token" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RefreshTokenCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid refresh token"));

        // Act
        var result = await _controller.RefreshToken(command);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    #endregion

    #region Logout

    [Fact]
    public async Task Logout_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "Bearer some-token";

        _mockMediator
            .Setup(m => m.Send(It.IsAny<LogoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Logout();

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion

    #region GetCurrentUser

    [Fact]
    public async Task GetCurrentUser_ReturnsOk_WithUserInfo()
    {
        // Arrange
        var claims = new[] { new Claim("sub", "1"), new Claim(ClaimTypes.Role, "Admin") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);

        var expectedResponse = new UserInfoDto
        {
            Id = 1,
            Username = "admin",
            Email = "admin@test.com",
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetCurrentUserQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserInfoDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(1, response.Data!.Id);
        Assert.Equal("Admin", response.Data.Role);
    }

    #endregion

    #region GetProfile

    [Fact]
    public async Task GetProfile_ReturnsOk_WithUserProfile()
    {
        // Arrange
        var expectedProfile = new UserDto
        {
            Id = 1,
            Username = "admin",
            Email = "admin@apptemplate.local"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetMyProfileQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        var result = await _controller.GetProfile();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("admin", response.Data!.Username);
    }

    #endregion

    #region UpdateProfile

    [Fact]
    public async Task UpdateProfile_ReturnsOk_WithUpdatedProfile()
    {
        // Arrange
        var command = new UpdateMyProfileCommand { Email = "new@example.com", FirstName = "Updated" };
        var expectedProfile = new UserDto
        {
            Id = 1,
            Username = "admin",
            Email = "new@example.com",
            FirstName = "Updated"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UpdateMyProfileCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        var result = await _controller.UpdateProfile(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal("new@example.com", response.Data!.Email);
    }

    #endregion

    #region ForgotPassword

    [Fact]
    public async Task ForgotPassword_ReturnsOk_Always()
    {
        // Arrange
        var command = new RequestPasswordResetCommand { Email = "user@example.com" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<RequestPasswordResetCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ForgotPassword(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(response.Success);
    }

    #endregion

    #region ResetPassword

    [Fact]
    public async Task ResetPassword_ReturnsOk_WhenTokenIsValid()
    {
        // Arrange
        var command = new ResetPasswordCommand
        {
            Token = "valid-token",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<ResetPasswordCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ResetPassword(command);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(response.Success);
    }

    #endregion

    #region ChangePassword

    [Fact]
    public async Task ChangePassword_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var claims = new[] { new Claim("sub", "1"), new Claim(ClaimTypes.Role, "User") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<ChangePasswordCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.True(response.Success);
    }

    [Fact]
    public async Task ChangePassword_ReturnsUnauthorized_WhenUserIdNotInClaims()
    {
        // Arrange - no claims set, so User.FindFirst("sub") will return null
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity());

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        // Act
        var result = await _controller.ChangePassword(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
        var response = Assert.IsType<ApiResponse>(unauthorizedResult.Value);
        Assert.False(response.Success);
    }

    #endregion
}
