package apptemplate.application.ports.services;

/**
 * Port interface for email operations.
 */
public interface EmailService {

    /**
     * Sends a password reset email.
     */
    void sendPasswordResetEmail(String email, String resetToken, String resetUrl);

    /**
     * Sends a generic email.
     */
    void sendEmail(String to, String subject, String body);
}
