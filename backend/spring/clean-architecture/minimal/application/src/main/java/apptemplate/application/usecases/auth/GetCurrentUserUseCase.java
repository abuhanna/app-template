package apptemplate.application.usecases.auth;

import apptemplate.application.dto.auth.UserInfoResponse;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.domain.exceptions.AuthenticationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Returns current user info from JWT claims.
 * In minimal variant, there is no users table -- all user info comes from security context.
 */
@Service
@RequiredArgsConstructor
public class GetCurrentUserUseCase {

    private final CurrentUserService currentUserService;

    public UserInfoResponse execute() {
        String userId = currentUserService.getCurrentUserId()
                .orElseThrow(() -> new AuthenticationException("User not authenticated"));

        String username = currentUserService.getCurrentUsername().orElse(null);
        String role = currentUserService.getCurrentUserRole();

        return UserInfoResponse.builder()
                .userId(userId)
                .username(username)
                .email(username)
                .role(role != null ? role.replace("ROLE_", "") : null)
                .build();
    }
}
