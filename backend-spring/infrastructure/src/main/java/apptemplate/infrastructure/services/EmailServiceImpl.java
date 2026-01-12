package apptemplate.infrastructure.services;

import apptemplate.application.ports.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@apptemplate.local}")
    private String fromAddress;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void sendPasswordResetEmail(String email, String name, String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        String subject = "Password Reset Request";
        String body = String.format("""
            Hello %s,

            You have requested to reset your password. Click the link below to reset it:

            %s

            This link will expire in 24 hours.

            If you did not request this, please ignore this email.

            Best regards,
            AppTemplate Team
            """, name, resetUrl);

        sendEmail(email, subject, body);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
