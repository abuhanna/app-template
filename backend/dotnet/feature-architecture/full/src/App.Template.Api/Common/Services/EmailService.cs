using System.Net;
using System.Net.Mail;

namespace App.Template.Api.Common.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl, CancellationToken ct = default);
    Task SendEmailAsync(string to, string subject, string body, CancellationToken ct = default);
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

    public Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl, CancellationToken ct = default)
    {
        var subject = "Password Reset Request";
        var body = $@"
            <h2>Password Reset</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href=""{resetUrl}"">Reset Password</a></p>
            <p>This link expires in 60 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>";

        return SendEmailAsync(email, subject, body, ct);
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var smtpHost = _configuration["Email:SmtpHost"];

        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogInformation("[DEV EMAIL] To: {To} | Subject: {Subject} | Body: {Body}", to, subject, body);
            return Task.CompletedTask;
        }

        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPass = _configuration["Email:SmtpPass"];
        var fromAddress = _configuration["Email:FromAddress"] ?? "noreply@apptemplate.local";
        var fromName = _configuration["Email:FromName"] ?? "AppTemplate";
        var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

        var client = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = enableSsl,
            Credentials = !string.IsNullOrEmpty(smtpUser)
                ? new NetworkCredential(smtpUser, smtpPass)
                : null
        };

        var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(to);

        return client.SendMailAsync(message, ct);
    }
}
