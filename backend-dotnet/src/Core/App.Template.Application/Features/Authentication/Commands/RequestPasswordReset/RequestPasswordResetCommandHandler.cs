using System.Security.Cryptography;
using AppTemplate.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.RequestPasswordReset;

public class RequestPasswordResetCommandHandler : IRequestHandler<RequestPasswordResetCommand, bool>
{
    private readonly IBpmDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RequestPasswordResetCommandHandler> _logger;

    public RequestPasswordResetCommandHandler(
        IBpmDbContext context,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<RequestPasswordResetCommandHandler> logger)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> Handle(RequestPasswordResetCommand request, CancellationToken cancellationToken)
    {
        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, cancellationToken);

        // Always return true to prevent email enumeration attacks
        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
            return true;
        }

        // Generate a secure random token
        var token = GenerateSecureToken();

        // Get token expiry from configuration (default 60 minutes)
        var expiryMinutes = _configuration.GetValue("App:PasswordResetTokenExpiryMinutes", 60);
        var expiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

        // Set token on user entity
        user.SetPasswordResetToken(token, expiry);
        await _context.SaveChangesAsync(cancellationToken);

        // Get base URL for reset link
        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var resetUrl = $"{baseUrl}/reset-password";

        // Send email
        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, token, resetUrl, cancellationToken);
            _logger.LogInformation("Password reset email sent to {Email}", request.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", request.Email);
            // Don't throw - we don't want to expose that the email exists
        }

        return true;
    }

    private static string GenerateSecureToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
