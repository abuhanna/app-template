using System.Security.Claims;
using App.Template.Api.Common.Models;
using App.Template.Api.Features.Auth.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(ApiResponse.Ok(response, "Login successful"));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<App.Template.Api.Features.Users.Dtos.UserDto>>> Register([FromBody] RegisterRequest request)
    {
        var user = await _authService.RegisterAsync(request);
        return StatusCode(201, ApiResponse.Ok(user, "Registration successful"));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<RefreshResponse>>> Refresh([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request);
        return Ok(ApiResponse.Ok(response, "Token refreshed successfully"));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var firstName = User.FindFirstValue("firstName");
        var lastName = User.FindFirstValue("lastName");
        var departmentId = User.FindFirstValue("departmentId");

        var userInfo = new UserInfoDto
        {
            Id = long.TryParse(userId, out var uid) ? uid : 0,
            Username = username ?? "",
            Email = email ?? "",
            FirstName = firstName,
            LastName = lastName,
            FullName = $"{firstName} {lastName}".Trim(),
            Role = role,
            DepartmentId = long.TryParse(departmentId, out var did) ? did : null,
            IsActive = true
        };

        return Ok(ApiResponse.Ok(userInfo));
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<App.Template.Api.Features.Users.Dtos.UserDto>>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var profile = await _authService.GetProfileAsync(userId);
        return Ok(ApiResponse.Ok(profile));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<App.Template.Api.Features.Users.Dtos.UserDto>>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var profile = await _authService.UpdateProfileAsync(userId, request);
        return Ok(ApiResponse.Ok(profile, "Profile updated successfully"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        await _authService.ChangePasswordAsync(userId, request);
        return Ok(ApiResponse.Ok("Password changed successfully"));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request);
        return Ok(ApiResponse.Ok("If an account with that email exists, a password reset link has been sent."));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(ApiResponse.Ok("Password has been reset successfully."));
    }
}
