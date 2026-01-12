package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.ResetPasswordRequest;
import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.PasswordService;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import apptemplate.domain.exceptions.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResetPasswordUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordService passwordService;

    @Transactional
    public void execute(ResetPasswordRequest request) {
        // Find user by reset token
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new AuthenticationException("Invalid or expired reset token"));

        // Check if token is expired (24 hours)
        if (user.getPasswordResetTokenExpiresAt() == null ||
            user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Reset token has expired");
        }

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match", "confirmPassword", "Passwords must match");
        }

        // Update password
        String hashedPassword = passwordService.hashPassword(request.getNewPassword());
        user.updatePassword(hashedPassword);
        user.clearPasswordResetToken();
        userRepository.save(user);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUserId(user.getId());

        log.info("Password successfully reset for user: {}", user.getUsername());
    }
}
