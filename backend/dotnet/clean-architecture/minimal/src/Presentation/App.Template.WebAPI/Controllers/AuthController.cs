using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Features.Authentication.Commands.Login;
using AppTemplate.Application.Features.Authentication.Commands.Logout;
using AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;

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
    /// Login to SSO and obtain JWT token
    /// </summary>
    /// <param name="command">Login credentials</param>
    /// <returns>JWT token and user information</returns>
    /// <response code="200">Login successful, returns JWT token</response>
    /// <response code="401">Invalid credentials</response>
    /// <response code="500">SSO service unavailable</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/login
    ///     {
    ///         "username": "user123",
    ///         "password": "password123"
    ///     }
    ///
    /// This endpoint proxies the request to the SSO service and returns the JWT token.
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
            var result = await _mediator.Send(command);
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
    /// Logout from SSO and invalidate JWT token
    /// </summary>
    /// <returns>Logout confirmation</returns>
    /// <response code="200">Logout successful</response>
    /// <response code="500">SSO service unavailable</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/logout
    ///     Authorization: Bearer {your-jwt-token}
    ///
    /// This endpoint proxies the logout request to the SSO service.
    /// The JWT token in the Authorization header will be invalidated.
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
    ///     GET /api/auth/me
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
}
