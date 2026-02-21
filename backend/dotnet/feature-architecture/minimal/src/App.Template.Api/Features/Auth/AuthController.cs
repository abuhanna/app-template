using App.Template.Api.Features.Auth.Dtos;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Auth;

/// <summary>Authentication endpoints</summary>
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
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _ssoAuthService.LoginAsync(request.Username ?? string.Empty, request.Password);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = ex.Message });
        }
    }

    /// <summary>Logout from SSO and invalidate JWT token</summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            await _ssoAuthService.LogoutAsync(authHeader);
            return Ok(new { message = "Logout successful" });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An error occurred during logout", details = ex.Message });
        }
    }

    /// <summary>Get current user information from JWT token</summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserInfoResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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

        return Ok(new UserInfoResponseDto
        {
            UserId = userId,
            Username = username,
            Email = email,
            Role = role,
            Claims = User.Claims.Select(c => new ClaimInfoDto { Type = c.Type, Value = c.Value }).ToList()
        });
    }
}
