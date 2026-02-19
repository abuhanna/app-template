using AppTemplate.Application.DTOs.Auth;

using MediatR;

using System.Security.Claims;

namespace AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;

/// <summary>
/// Query to get current user information from JWT claims
/// </summary>
public record GetCurrentUserQuery : IRequest<UserInfoResponseDto>
{
    /// <summary>
    /// Claims principal from authenticated user
    /// </summary>
    public ClaimsPrincipal User { get; init; } = null!;
}
