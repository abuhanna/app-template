package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.ForgotPasswordRequest;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.EmailService;
import apptemplate.domain.entities.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestPasswordResetUseCase {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public void execute(ForgotPasswordRequest request) {
        // Always return success to prevent email enumeration
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            log.debug("Password reset requested for non-existent email: {}", request.getEmail());
            return;
        }

        User user = userOpt.get();

        if (!user.isActive()) {
            log.debug("Password reset requested for inactive user: {}", user.getUsername());
            return;
        }

        // Generate reset token
        String resetToken = generateResetToken();
        user.setPasswordResetToken(resetToken);
        userRepository.save(user);

        // Send email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetToken);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
            // Don't expose the error to the user
        }
    }

    private String generateResetToken() {
        return UUID.randomUUID().toString().replace("-", "") +
               UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
