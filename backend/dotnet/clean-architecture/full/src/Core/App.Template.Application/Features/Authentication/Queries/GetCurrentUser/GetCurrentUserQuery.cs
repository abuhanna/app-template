using AppTemplate.Application.DTOs.Auth;

using MediatR;

namespace AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;

/// <summary>
/// Query to get current user information from database
/// </summary>
public record GetCurrentUserQuery : IRequest<UserInfoDto>;
