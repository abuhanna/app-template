using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

/// <summary>Authentication endpoints (SSO-based)</summary>
[AllowAnonymous]
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISsoAuthService _ssoAuthService;

    public AuthController(ISsoAuthService ssoAuthService)
    {
        _ssoAuthService = ssoAuthService;
    }

    /// <summary>Login via SSO and obtain JWT token</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _ssoAuthService.LoginAsync(request.Username ?? string.Empty, request.Password, cancellationToken);
            return Ok(ApiResponse.Ok(result, "Login successful"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, ApiResponse.Fail(ex.Message));
        }
    }

    /// <summary>Logout from SSO and invalidate JWT token</summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            await _ssoAuthService.LogoutAsync(authHeader, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse.Fail("An error occurred during logout", new List<string> { ex.Message }));
        }
    }

    /// <summary>Get current user information from JWT token</summary>
    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value
            ?? User.FindFirst("id")?.Value;

        var username = User.FindFirst("username")?.Value
            ?? User.FindFirst("name")?.Value;

        var email = User.FindFirst("email")?.Value;

        var role = User.FindFirst("role")?.Value
            ?? User.FindFirst("group")?.Value;

        var name = User.FindFirst("name")?.Value ?? "";
        var nameParts = name.Split(' ', 2);

        return Ok(ApiResponse.Ok(new UserInfoResponseDto
        {
            UserId = userId,
            Username = username,
            Email = email,
            FirstName = nameParts.Length > 0 ? nameParts[0] : null,
            LastName = nameParts.Length > 1 ? nameParts[1] : null,
            FullName = name,
            Role = role,
            IsActive = true,
            Claims = User.Claims.Select(c => new ClaimInfoDto { Type = c.Type, Value = c.Value }).ToList()
        }, "User info retrieved successfully"));
    }
}
