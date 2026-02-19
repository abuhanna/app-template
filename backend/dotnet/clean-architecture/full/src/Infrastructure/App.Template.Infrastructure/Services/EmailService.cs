using System.Net;
using System.Net.Mail;
using AppTemplate.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Infrastructure.Services;

/// <summary>
/// Email service implementation using SMTP
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl, CancellationToken cancellationToken = default)
    {
        var subject = "Password Reset Request";
        var body = GetPasswordResetEmailTemplate(resetUrl, resetToken);

        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPortString = _configuration["Email:SmtpPort"];
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPass = _configuration["Email:SmtpPass"];
        var fromAddress = _configuration["Email:FromAddress"] ?? "noreply@apptemplate.local";
        var fromName = _configuration["Email:FromName"] ?? "AppTemplate";
        var enableSsl = _configuration.GetValue("Email:EnableSsl", true);

        // In development, if SMTP is not configured, log the email instead of sending
        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            _logger.LogWarning(
                "SMTP not configured. Email would have been sent to: {To}, Subject: {Subject}, Body: {Body}",
                to, subject, body);
            return;
        }

        if (!int.TryParse(smtpPortString, out var smtpPort))
        {
            smtpPort = 587; // Default to TLS port
        }

        try
        {
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
            };

            // Add credentials if provided
            if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPass))
            {
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromAddress, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To} with subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} with subject: {Subject}", to, subject);
            throw;
        }
    }

    private static string GetPasswordResetEmailTemplate(string resetUrl, string token)
    {
        return $"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #1976d2; margin-bottom: 20px;">Password Reset Request</h1>

                    <p>You have requested to reset your password. Click the button below to proceed:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{resetUrl}?token={token}"
                           style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, copy and paste this link into your browser:
                        <br>
                        <a href="{resetUrl}?token={token}" style="color: #1976d2; word-break: break-all;">
                            {resetUrl}?token={token}
                        </a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                    <p style="color: #999; font-size: 12px;">
                        This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
                    </p>
                </div>
            </body>
            </html>
            """;
    }
}
