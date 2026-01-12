using AppTemplate.Application.DTOs.Auth;

using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.Login;

/// <summary>
/// Command to login and obtain JWT token
/// </summary>
public record LoginCommand : IRequest<LoginResponseDto>
{
    /// <summary>
    /// Username or email
    /// </summary>
    public string Username { get; init; } = string.Empty;

    /// <summary>
    /// User password
    /// </summary>
    public string Password { get; init; } = string.Empty;
}
