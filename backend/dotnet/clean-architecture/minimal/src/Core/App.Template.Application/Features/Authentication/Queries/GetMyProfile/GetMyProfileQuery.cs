using AppTemplate.Application.DTOs;
using MediatR;

namespace AppTemplate.Application.Features.Authentication.Queries.GetMyProfile;

/// <summary>
/// Query to get the current user's profile
/// </summary>
public record GetMyProfileQuery : IRequest<UserDto>;
