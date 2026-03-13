package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.LoginRequest;
import apptemplate.application.dto.auth.LoginResponse;
import apptemplate.application.dto.auth.UserInfoResponse;
import apptemplate.application.ports.services.JwtTokenService;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Validates an external SSO token and returns user info from JWT claims.
 * In minimal variant, there is no users table -- all user info comes from JWT claims.
 */
@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final JwtTokenService jwtTokenService;

    public LoginResponse execute(LoginRequest request) {
        String token = request.getToken();
        if (token == null || token.isBlank()) {
            throw new AuthenticationException("Token is required");
        }

        if (!jwtTokenService.validateToken(token)) {
            throw new AuthenticationException("Invalid or expired token");
        }

        String userId = jwtTokenService.getUserIdFromToken(token);
        String username = jwtTokenService.getUsernameFromToken(token);
        String email = jwtTokenService.getEmailFromToken(token);
        String role = jwtTokenService.getRoleFromToken(token);

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .userId(userId)
                .username(username != null ? username : email)
                .email(email)
                .role(role)
                .build();

        return LoginResponse.builder()
                .accessToken(token)
                .expiresIn(jwtTokenService.getExpirationSeconds())
                .user(userInfo)
                .build();
    }
}
