package apptemplate.application.usecases.user;

import apptemplate.application.dto.user.ChangePasswordRequest;
import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.application.ports.services.PasswordService;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.AuthenticationException;
import apptemplate.domain.exceptions.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class ChangeUserPasswordUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordService passwordService;

    @Transactional
    public void execute(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Verify current password
        if (!passwordService.verifyPassword(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ValidationException("currentPassword", "Current password is incorrect");
        }

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("confirmPassword", "Passwords must match");
        }

        // Update password
        String hashedPassword = passwordService.hashPassword(request.getNewPassword());
        user.updatePassword(hashedPassword);
        userRepository.save(user);

        // Revoke all refresh tokens for security (invalidates all existing sessions)
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
