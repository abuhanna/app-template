using System.Security.Claims;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register(RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        return StatusCode(201, ApiResponse.Ok(response, "Registration successful"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(ApiResponse.Ok(response, "Login successful"));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<RefreshResponse>>> Refresh(RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request);
        return Ok(ApiResponse.Ok(response, "Token refreshed"));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _authService.LogoutAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var userInfo = await _authService.GetCurrentUserAsync(userId);
        return Ok(ApiResponse.Ok(userInfo, "User info retrieved"));
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await _authService.GetProfileAsync(userId);
        return Ok(ApiResponse.Ok(profile, "Profile retrieved"));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var updated = await _authService.UpdateProfileAsync(userId, request);
        return Ok(ApiResponse.Ok(updated, "Profile updated"));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse>> ChangePassword(ChangePasswordRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _authService.ChangePasswordAsync(userId, request);
        return Ok(ApiResponse.Ok("Password changed successfully"));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse>> ForgotPassword(ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request);
        return Ok(ApiResponse.Ok("If your email is registered, you will receive a password reset link"));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword(ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(ApiResponse.Ok("Password reset successful"));
    }
}
