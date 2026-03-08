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

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// Authentication endpoints
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;

    public AuthController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Login and obtain JWT token
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var commandWithIp = command with { ClientIpAddress = ipAddress };
            var result = await _mediator.Send(commandWithIp);
            return Ok(ApiResponse.Ok(result, "Login successful"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.Fail(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                ApiResponse.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Refresh JWT tokens using a refresh token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<RefreshResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(ApiResponse.Ok(result, "Token refreshed successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Logout and invalidate JWT token
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var command = new LogoutCommand { AuthorizationHeader = authHeader };
        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Get current user information from JWT token
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserInfoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var query = new GetCurrentUserQuery { User = User };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// Get current user's full profile
    /// </summary>
    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _mediator.Send(new GetMyProfileQuery());
        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateMyProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse.Ok(result, "Profile updated successfully"));
    }

    /// <summary>
    /// Request a password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] RequestPasswordResetCommand command)
    {
        await _mediator.Send(command);
        return Ok(ApiResponse.Ok("If an account with that email exists, a password reset link has been sent."));
    }

    /// <summary>
    /// Reset password using a reset token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        await _mediator.Send(command);
        return Ok(ApiResponse.Ok("Password has been reset successfully. You can now login with your new password."));
    }

    /// <summary>
    /// Change password for the authenticated user
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!long.TryParse(userIdStr, out var userId))
            return Unauthorized(ApiResponse.Fail("User not authenticated"));

        var command = new ChangePasswordCommand
        {
            UserId = userId,
            CurrentPassword = request.CurrentPassword,
            NewPassword = request.NewPassword,
            ConfirmPassword = request.ConfirmPassword
        };

        await _mediator.Send(command);
        return Ok(ApiResponse.Ok("Password changed successfully"));
    }
}
