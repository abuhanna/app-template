using System.Net;
using System.Net.Mail;

namespace App.Template.Api.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string token, string resetUrl);
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string token, string resetUrl)
    {
        var subject = "Password Reset Request";
        var body = $"""
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password (expires in 60 minutes):</p>
            <p><a href="{resetUrl}?token={token}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            """;

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _configuration["Email:SmtpHost"];

        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogInformation("[DEV EMAIL] To: {To} | Subject: {Subject} | Body: {Body}", to, subject, body);
            return;
        }

        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var fromAddress = _configuration["Email:FromAddress"] ?? "noreply@apptemplate.local";
        var fromName = _configuration["Email:FromName"] ?? "AppTemplate";
        var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = enableSsl,
            Credentials = new NetworkCredential(
                _configuration["Email:Username"],
                _configuration["Email:Password"])
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
