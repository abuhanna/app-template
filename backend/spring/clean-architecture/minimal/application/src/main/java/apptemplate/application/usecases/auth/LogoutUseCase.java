package apptemplate.application.usecases.auth;

import apptemplate.application.ports.repositories.RefreshTokenRepository;
import apptemplate.application.ports.services.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public void execute(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        String ipAddress = currentUserService.getClientIpAddress();

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.revoke(ipAddress);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void executeForUser(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
