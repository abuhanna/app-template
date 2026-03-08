using App.Template.Api.Common.Models;
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
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _ssoAuthService.LoginAsync(request.Username ?? string.Empty, request.Password);
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        await _ssoAuthService.LogoutAsync(authHeader);
        return NoContent();
    }

    /// <summary>Get current user information from JWT token</summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserInfoResponseDto>), StatusCodes.Status200OK)]
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

        var firstName = User.FindFirst("given_name")?.Value
            ?? User.FindFirst("firstName")?.Value;

        var lastName = User.FindFirst("family_name")?.Value
            ?? User.FindFirst("lastName")?.Value;

        var fullName = User.FindFirst("name")?.Value;
        if (string.IsNullOrWhiteSpace(fullName) && (firstName != null || lastName != null))
            fullName = $"{firstName} {lastName}".Trim();

        var userInfo = new UserInfoResponseDto
        {
            UserId = userId,
            Username = username,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            FullName = fullName,
            Role = role,
            IsActive = true,
            Claims = User.Claims.Select(c => new ClaimInfoDto { Type = c.Type, Value = c.Value }).ToList()
        };

        return Ok(ApiResponse.Ok(userInfo, "User info retrieved successfully"));
    }
}
