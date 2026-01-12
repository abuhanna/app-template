using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponseDto>
{
    private readonly IBpmDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RefreshTokenCommandHandler> _logger;

    public RefreshTokenCommandHandler(
        IBpmDbContext context,
        IJwtTokenService jwtTokenService,
        IConfiguration configuration,
        ILogger<RefreshTokenCommandHandler> logger)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // Find the refresh token
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Department)
            .FirstOrDefaultAsync(rt => rt.Token == request.Token, cancellationToken);

        if (refreshToken == null)
        {
            _logger.LogWarning("Refresh token not found");
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        if (!refreshToken.IsActive)
        {
            _logger.LogWarning("Refresh token is no longer active for user {UserId}", refreshToken.UserId);

            // If token is revoked, revoke all descendant tokens (token reuse detection)
            if (refreshToken.IsRevoked)
            {
                await RevokeDescendantRefreshTokensAsync(refreshToken, cancellationToken);
            }

            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var user = refreshToken.User;
        if (!user.IsActive)
        {
            _logger.LogWarning("User account is deactivated: {UserId}", user.Id);
            throw new UnauthorizedAccessException("User account is deactivated");
        }

        // Rotate refresh token - revoke old one and create new one
        var newRefreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpirationDays = _jwtTokenService.GetRefreshTokenExpirationDays();
        var newRefreshTokenExpiry = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        // Revoke old token
        refreshToken.Revoke(replacedByToken: newRefreshTokenValue);

        // Create new refresh token
        var newRefreshToken = new Domain.Entities.RefreshToken(
            newRefreshTokenValue,
            user.Id,
            newRefreshTokenExpiry
        );
        _context.RefreshTokens.Add(newRefreshToken);

        // Generate new JWT token
        var token = _jwtTokenService.GenerateToken(user);
        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Token refreshed for user: {Username}", user.Username);

        return new LoginResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = newRefreshTokenValue,
            RefreshTokenExpiresAt = newRefreshTokenExpiry,
            User = new UserInfoDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                Name = user.Name ?? user.Username,
                Role = user.Role,
                DepartmentId = user.DepartmentId?.ToString(),
                DepartmentName = user.Department?.Name
            }
        };
    }

    private async Task RevokeDescendantRefreshTokensAsync(
        Domain.Entities.RefreshToken refreshToken,
        CancellationToken cancellationToken)
    {
        // Follow the chain of replaced tokens and revoke them
        if (!string.IsNullOrEmpty(refreshToken.ReplacedByToken))
        {
            var childToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken.ReplacedByToken, cancellationToken);

            if (childToken != null && childToken.IsActive)
            {
                childToken.Revoke();
                await RevokeDescendantRefreshTokensAsync(childToken, cancellationToken);
            }
        }
    }
}
