using System.Security.Cryptography;
using App.Template.Api.Common.Entities;
using App.Template.Api.Common.Services;
using App.Template.Api.Data;
using App.Template.Api.Features.Auth.Dtos;
using App.Template.Api.Features.Users;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task LogoutAsync();
    Task<UserDto> GetProfileAsync(string userId);
    Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext context,
        IPasswordHashService passwordHashService,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var identifier = !string.IsNullOrEmpty(request.Username) ? request.Username : request.Email;
        if (string.IsNullOrEmpty(identifier))
            throw new InvalidOperationException("Username or email is required");

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier);

        if (user == null)
            throw new InvalidOperationException("Invalid username or password");

        if (!user.IsActive)
            throw new InvalidOperationException("User account is deactivated");

        if (!_passwordHashService.VerifyPassword(request.Password, user.PasswordHash))
            throw new InvalidOperationException("Invalid username or password");

        var token = _jwtTokenGenerator.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");
        var refreshTokenValue = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpirationDays = _jwtTokenGenerator.GetRefreshTokenExpirationDays();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = refreshTokenExpiry,
            CreatedAt = DateTime.UtcNow
        };
        _context.RefreshTokens.Add(refreshToken);
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Login successful for user: {Username}", user.Username);

        return new LoginResponse
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = refreshTokenValue,
            RefreshTokenExpiresAt = refreshTokenExpiry,
            User = MapToUserInfo(user)
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var existingToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Department)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (existingToken == null)
            throw new InvalidOperationException("Invalid refresh token");

        if (existingToken.IsRevoked)
        {
            var allTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == existingToken.UserId && rt.RevokedAt == null)
                .ToListAsync();
            foreach (var t in allTokens)
                t.Revoke();
            await _context.SaveChangesAsync();
            throw new InvalidOperationException("Refresh token reuse detected. All sessions revoked.");
        }

        if (existingToken.IsExpired)
            throw new InvalidOperationException("Refresh token has expired");

        var user = existingToken.User;
        if (!user.IsActive)
            throw new InvalidOperationException("User account is deactivated");

        var newRefreshTokenValue = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpirationDays = _jwtTokenGenerator.GetRefreshTokenExpirationDays();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        existingToken.Revoke(replacedByToken: newRefreshTokenValue);

        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = user.Id,
            ExpiresAt = refreshTokenExpiry,
            CreatedAt = DateTime.UtcNow
        };
        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        var token = _jwtTokenGenerator.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        return new LoginResponse
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = newRefreshTokenValue,
            RefreshTokenExpiresAt = refreshTokenExpiry,
            User = MapToUserInfo(user)
        };
    }

    public Task LogoutAsync()
    {
        _logger.LogInformation("Logout completed successfully");
        return Task.CompletedTask;
    }

    public async Task<UserDto> GetProfileAsync(string userId)
    {
        if (!long.TryParse(userId, out var id))
            throw new KeyNotFoundException("User not found");

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("User not found");

        return MapToUserDto(user);
    }

    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        if (!long.TryParse(userId, out var id))
            throw new KeyNotFoundException("User not found");

        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("User not found");

        if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Email))
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailExists)
                throw new InvalidOperationException("Email is already in use");
            user.Email = request.Email;
        }

        await _context.SaveChangesAsync();
        return MapToUserDto(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            _logger.LogInformation("Password reset requested for non-existent email: {Email}", request.Email);
            return;
        }

        var tokenBytes = new byte[32];
        RandomNumberGenerator.Fill(tokenBytes);
        var resetToken = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var expiryMinutes = int.Parse(_configuration["App:PasswordResetTokenExpiryMinutes"] ?? "60");

        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(expiryMinutes);
        await _context.SaveChangesAsync();

        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var resetUrl = $"{baseUrl}/reset-password?token={resetToken}";
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken, resetUrl);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new InvalidOperationException("Passwords do not match");

        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.Token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow)
            ?? throw new InvalidOperationException("Invalid or expired reset token");

        if (user.PasswordHistory.Any(h => _passwordHashService.VerifyPassword(request.NewPassword, h)))
            throw new InvalidOperationException("Password was recently used. Please choose a different password.");

        user.PasswordHistory.Add(user.PasswordHash);
        if (user.PasswordHistory.Count > 5)
            user.PasswordHistory.RemoveAt(0);

        user.PasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        await _context.SaveChangesAsync();
    }

    private static UserInfoDto MapToUserInfo(User user) => new()
    {
        Id = user.Id.ToString(),
        Username = user.Username,
        Email = user.Email,
        Name = user.Name ?? user.Username,
        Role = user.Role,
        DepartmentId = user.DepartmentId?.ToString(),
        DepartmentName = user.Department?.Name
    };

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        FullName = user.Name,
        Role = user.Role,
        DepartmentId = user.DepartmentId,
        DepartmentName = user.Department?.Name,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };
}
