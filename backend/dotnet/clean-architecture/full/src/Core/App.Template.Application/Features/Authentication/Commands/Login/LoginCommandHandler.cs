using AppTemplate.Application.DTOs.Auth;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Login;

/// <summary>
/// Handler for LoginCommand - supports local authentication
/// </summary>
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        IConfiguration configuration,
        ILogger<LoginCommandHandler> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var identifier = !string.IsNullOrEmpty(request.Username) ? request.Username : request.Email;
        _logger.LogInformation("Processing login request for user: {Username}", identifier);

        var localResult = await TryLocalAuthAsync(request, cancellationToken);
        if (localResult != null)
        {
            return localResult;
        }

        throw new InvalidOperationException("Invalid username or password");
    }

    private async Task<LoginResponseDto?> TryLocalAuthAsync(LoginCommand request, CancellationToken cancellationToken)
    {
        var identifier = !string.IsNullOrEmpty(request.Username) ? request.Username : request.Email;

        if (string.IsNullOrEmpty(identifier))
        {
            throw new InvalidOperationException("Username or email is required");
        }

        // Find user by username or email
        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u =>
                u.Username == identifier ||
                u.Email == identifier,
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
