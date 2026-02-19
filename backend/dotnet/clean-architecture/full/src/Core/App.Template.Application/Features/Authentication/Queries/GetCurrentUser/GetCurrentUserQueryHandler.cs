using AppTemplate.Application.DTOs.Auth;

using MediatR;

namespace AppTemplate.Application.Features.Authentication.Queries.GetCurrentUser;

/// <summary>
/// Handler for GetCurrentUserQuery
/// </summary>
public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserInfoResponseDto>
{
    public Task<UserInfoResponseDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userId = request.User.FindFirst("sub")?.Value
            ?? request.User.FindFirst("userId")?.Value
            ?? request.User.FindFirst("id")?.Value;

        var username = request.User.FindFirst("username")?.Value
            ?? request.User.FindFirst("name")?.Value;

        var email = request.User.FindFirst("email")?.Value;

        var role = request.User.FindFirst("role")?.Value
            ?? request.User.FindFirst("group")?.Value;

        var userInfo = new UserInfoResponseDto
        {
            UserId = userId,
            Username = username,
            Email = email,
            Role = role,
            Claims = request.User.Claims.Select(c => new ClaimInfoDto
            {
                Type = c.Type,
                Value = c.Value
            }).ToList()
        };

        return Task.FromResult(userInfo);
    }
}
