namespace AppTemplate.Application.Interfaces;

/// <summary>
/// Service for sending emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send a password reset email to the user
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="resetToken">Password reset token</param>
    /// <param name="resetUrl">Full URL for password reset page</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send a generic email
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="body">Email body (HTML)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}
