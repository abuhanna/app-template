package apptemplate.application.usecases.user;

import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.repositories.UserRepository;
import apptemplate.domain.entities.User;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void execute(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User", id));

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUserId(id);

        // Delete user
        userRepository.delete(user);
    }
}
