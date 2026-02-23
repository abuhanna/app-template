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
    /// <param name="command">Login credentials</param>
    /// <returns>JWT token and user information</returns>
    /// <response code="200">Login successful, returns JWT token</response>
    /// <response code="401">Invalid credentials</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/auth/login
    ///     {
    ///         "username": "user123",
    ///         "password": "password123"
    ///     }
    ///
    /// The token should be included in subsequent API requests as: Authorization: Bearer {token}
    /// </remarks>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var commandWithIp = command with { ClientIpAddress = ipAddress };
            var result = await _mediator.Send(commandWithIp);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = ex.Message });
        }
    }

    /// <summary>
    /// Refresh JWT tokens using a refresh token
    /// </summary>
    /// <param name="command">Refresh token</param>
    /// <returns>New JWT token and refresh token</returns>
    /// <response code="200">Tokens refreshed successfully</response>
    /// <response code="401">Invalid or expired refresh token</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/refresh
    ///     {
    ///         "token": "your-refresh-token"
    ///     }
    ///
    /// This endpoint uses refresh token rotation - the old refresh token is invalidated
    /// and a new one is returned with the new access token.
    /// </remarks>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Logout and invalidate JWT token
    /// </summary>
    /// <returns>Logout confirmation</returns>
    /// <response code="200">Logout successful</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/auth/logout
    ///     Authorization: Bearer {your-jwt-token}
    ///
    /// The JWT token in the Authorization header will be invalidated (client-side).
    /// </remarks>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            var command = new LogoutCommand { AuthorizationHeader = authHeader };

            await _mediator.Send(command);
            return Ok(new { message = "Logout successful" });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "An error occurred during logout", details = ex.Message });
        }
    }

    /// <summary>
    /// Get current user information from JWT token
    /// </summary>
    /// <returns>Current user information</returns>
    /// <response code="200">User information retrieved</response>
    /// <response code="401">Not authenticated</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/auth/me
    ///     Authorization: Bearer {your-jwt-token}
    ///
    /// This endpoint extracts and returns user information from the JWT token.
    /// </remarks>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserInfoResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var query = new GetCurrentUserQuery { User = User };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get current user's full profile
    /// </summary>
    /// <returns>User profile data</returns>
    /// <response code="200">Profile retrieved successfully</response>
    /// <response code="401">Not authenticated</response>
    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _mediator.Send(new GetMyProfileQuery());
        return Ok(result);
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    /// <param name="command">Profile update data</param>
    /// <returns>Updated user profile</returns>
    /// <response code="200">Profile updated successfully</response>
    /// <response code="400">Validation error</response>
    /// <response code="401">Not authenticated</response>
    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateMyProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Request a password reset email
    /// </summary>
    /// <param name="command">Email address for password reset</param>
    /// <returns>Confirmation that request was processed</returns>
    /// <response code="200">Request processed (always returns success to prevent email enumeration)</response>
    /// <response code="400">Validation error</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/forgot-password
    ///     {
    ///         "email": "user@example.com"
    ///     }
    ///
    /// A password reset link will be sent to the email if the account exists.
    /// For security reasons, this endpoint always returns success regardless of whether the email exists.
    /// </remarks>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] RequestPasswordResetCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
    }

    /// <summary>
    /// Reset password using a reset token
    /// </summary>
    /// <param name="command">Reset token and new password</param>
    /// <returns>Confirmation that password was reset</returns>
    /// <response code="200">Password reset successfully</response>
    /// <response code="400">Validation error or invalid/expired token</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/reset-password
    ///     {
    ///         "token": "reset-token-from-email",
    ///         "newPassword": "NewSecurePassword123",
    ///         "confirmPassword": "NewSecurePassword123"
    ///     }
    ///
    /// The token is obtained from the password reset email link.
    /// Password must be at least 8 characters and contain uppercase, lowercase, and digits.
    /// </remarks>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        try
        {
            await _mediator.Send(command);
            return Ok(new { message = "Password has been reset successfully. You can now login with your new password." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Change password for the authenticated user
    /// </summary>
    /// <param name="request">Current and new password</param>
    /// <returns>Confirmation that password was changed</returns>
    /// <response code="200">Password changed successfully</response>
    /// <response code="400">Validation error or incorrect current password</response>
    /// <response code="401">Not authenticated</response>
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "User not authenticated" });

            var command = new ChangePasswordCommand
            {
                UserId = userId,
                CurrentPassword = request.CurrentPassword,
                NewPassword = request.NewPassword,
                ConfirmPassword = request.ConfirmPassword
            };

            await _mediator.Send(command);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
