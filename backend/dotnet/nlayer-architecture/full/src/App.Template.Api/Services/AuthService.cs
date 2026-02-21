using System.Security.Cryptography;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;

namespace App.Template.Api.Services;

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
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IPasswordHashService passwordHashService,
        IEmailService emailService,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHashService = passwordHashService;
        _emailService = emailService;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        User? user = null;
        if (!string.IsNullOrEmpty(request.Username))
            user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null && !string.IsNullOrEmpty(request.Email))
            user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials");

        if (!_passwordHashService.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var accessToken = _jwtTokenGenerator.GenerateToken(user);
        var refreshTokenValue = _jwtTokenGenerator.GenerateRefreshToken();
        var expirationDays = _jwtTokenGenerator.GetRefreshTokenExpirationDays();
        var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedByIp = ip
        };

        await _refreshTokenRepository.AddAsync(refreshToken);

        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        return new LoginResponse
        {
            Token = accessToken,
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = refreshTokenValue,
            RefreshTokenExpiresAt = refreshToken.ExpiresAt,
            User = MapToUserInfo(user)
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var existingToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken)
            ?? throw new UnauthorizedAccessException("Invalid refresh token");

        if (existingToken.IsRevoked)
        {
            var activeTokens = await _refreshTokenRepository.GetActiveByUserIdAsync(existingToken.UserId);
            foreach (var t in activeTokens)
            {
                t.Revoke();
                await _refreshTokenRepository.UpdateAsync(t);
            }
            throw new UnauthorizedAccessException("Refresh token reuse detected. All sessions revoked.");
        }

        if (!existingToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token is expired");

        var user = existingToken.User;
        var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        var newRefreshTokenValue = _jwtTokenGenerator.GenerateRefreshToken();
        var expirationDays = _jwtTokenGenerator.GetRefreshTokenExpirationDays();

        existingToken.Revoke(ip, newRefreshTokenValue);
        await _refreshTokenRepository.UpdateAsync(existingToken);

        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedByIp = ip
        };
        await _refreshTokenRepository.AddAsync(newRefreshToken);

        var accessToken = _jwtTokenGenerator.GenerateToken(user);
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        return new LoginResponse
        {
            Token = accessToken,
            ExpiresIn = expirationMinutes * 60,
            RefreshToken = newRefreshTokenValue,
            RefreshTokenExpiresAt = newRefreshToken.ExpiresAt,
            User = MapToUserInfo(user)
        };
    }

    public async Task LogoutAsync()
    {
        var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out var userId)) return;

        var activeTokens = await _refreshTokenRepository.GetActiveByUserIdAsync(userId);
        var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        foreach (var token in activeTokens)
        {
            token.Revoke(ip);
            await _refreshTokenRepository.UpdateAsync(token);
        }
    }

    public async Task<UserDto> GetProfileAsync(string userId)
    {
        if (!long.TryParse(userId, out var id))
            throw new KeyNotFoundException("User not found");

        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found");

        return MapToDto(user);
    }

    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        if (!long.TryParse(userId, out var id))
            throw new KeyNotFoundException("User not found");

        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found");

        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var emailExists = await _userRepository.GetByEmailAsync(request.Email);
            if (emailExists != null)
                throw new InvalidOperationException("Email is already in use");
            user.Email = request.Email;
        }

        if (request.Name != null) user.Name = request.Name;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null) return; // No enumeration

        var tokenBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var expiryMinutes = int.Parse(_configuration["App:PasswordResetTokenExpiryMinutes"] ?? "60");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(expiryMinutes);
        await _userRepository.UpdateAsync(user);

        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var resetUrl = $"{baseUrl}/reset-password";
        await _emailService.SendPasswordResetEmailAsync(user.Email, token, resetUrl);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new InvalidOperationException("Passwords do not match");

        var user = await _userRepository.GetByPasswordResetTokenAsync(request.Token)
            ?? throw new InvalidOperationException("Invalid or expired reset token");

        if (user.PasswordHistory.Any(h => _passwordHashService.VerifyPassword(request.NewPassword, h)))
            throw new InvalidOperationException("Password was recently used. Please choose a different password.");

        user.PasswordHistory.Add(user.PasswordHash);
        if (user.PasswordHistory.Count > 5)
            user.PasswordHistory.RemoveAt(0);

        user.PasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _userRepository.UpdateAsync(user);
    }

    private static UserInfoDto MapToUserInfo(User user) => new()
    {
        Id = user.Id.ToString(),
        Username = user.Username,
        Email = user.Email,
        Name = user.Name,
        Role = user.Role,
        DepartmentId = user.DepartmentId?.ToString(),
        DepartmentName = user.Department?.Name
    };

    private static UserDto MapToDto(User user) => new()
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
