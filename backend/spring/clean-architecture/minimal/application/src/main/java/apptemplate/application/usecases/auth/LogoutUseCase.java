package apptemplate.application.usecases.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Logout use case. In minimal variant, there are no refresh tokens stored in the database.
 * The client simply discards its token.
 */
@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    public void execute(String refreshToken) {
        // No-op: minimal variant does not store refresh tokens.
        // Client-side token invalidation is sufficient.
    }
}
