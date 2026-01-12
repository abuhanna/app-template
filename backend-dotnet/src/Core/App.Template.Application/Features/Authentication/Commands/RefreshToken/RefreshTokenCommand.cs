using AppTemplate.Application.DTOs.Auth;
using MediatR;

namespace AppTemplate.Application.Features.Authentication.Commands.RefreshToken;

/// <summary>
/// Command to refresh JWT tokens using a refresh token
/// </summary>
public record RefreshTokenCommand : IRequest<LoginResponseDto>
{
    /// <summary>
    /// The refresh token
    /// </summary>
    public required string Token { get; init; }
}
