using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Login;

/// <summary>
/// Handler for LoginCommand - supports both local and SSO authentication
/// </summary>
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IBpmDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ISsoAuthService? _ssoAuthService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IBpmDbContext context,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        IConfiguration configuration,
        ILogger<LoginCommandHandler> logger,
        ISsoAuthService? ssoAuthService = null)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
        _ssoAuthService = ssoAuthService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing login request for user: {Username}", request.Username);

        var useLocalAuth = _configuration.GetValue<bool>("Auth:UseLocalAuth", true);
        var ssoEnabled = _configuration.GetValue<bool>("Sso:Enabled", false);

        // Try local authentication first if enabled
        if (useLocalAuth)
        {
            var localResult = await TryLocalAuthAsync(request, cancellationToken);
            if (localResult != null)
            {
                return localResult;
            }
        }

        // Fall back to SSO if enabled and local auth failed or not enabled
        if (ssoEnabled && _ssoAuthService != null)
        {
            _logger.LogInformation("Attempting SSO authentication for user: {Username}", request.Username);
            return await _ssoAuthService.LoginAsync(request.Username, request.Password, cancellationToken);
        }

        throw new InvalidOperationException("Invalid username or password");
    }

    private async Task<LoginResponseDto?> TryLocalAuthAsync(LoginCommand request, CancellationToken cancellationToken)
    {
        // Find user by username or email
        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u =>
                u.Username == request.Username ||
                u.Email == request.Username,
                cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User not found: {Username}", request.Username);
            return null;
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("User account is deactivated: {Username}", request.Username);
            throw new InvalidOperationException("User account is deactivated");
        }

        // Verify password
        if (!_passwordHashService.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Invalid password for user: {Username}", request.Username);
            return null;
        }

        // Generate JWT token
        var token = _jwtTokenService.GenerateToken(user);
        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

        // Generate refresh token
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpirationDays = _jwtTokenService.GetRefreshTokenExpirationDays();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        var refreshToken = new Domain.Entities.RefreshToken(refreshTokenValue, user.Id, refreshTokenExpiry);
        _context.RefreshTokens.Add(refreshToken);

        // Update last login
        user.RecordLogin();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Login successful for user: {Username}", request.Username);

        return new LoginResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = refreshTokenValue,
            RefreshTokenExpiresAt = refreshTokenExpiry,
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
}
