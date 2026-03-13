package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.LoginResponse;
import apptemplate.application.dto.auth.RefreshTokenRequest;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Refresh token use case. In minimal variant, token refresh is handled by the external SSO provider.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

    public LoginResponse execute(RefreshTokenRequest request) {
        // Minimal variant does not store refresh tokens.
        throw new AuthenticationException("Token refresh is handled by the external authentication provider");
    }
}
