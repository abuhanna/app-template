package com.apptemplate.api.features.auth;

import com.apptemplate.api.common.exception.AuthenticationException;
import com.apptemplate.api.common.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Auth service for minimal variant (external auth).
 * No users table or refresh tokens table -- all user info comes from JWT claims.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtUtils jwtUtils;

    public AuthResponse validateToken(ValidateTokenRequest request) {
        try {
            String token = request.getToken();
            String email = jwtUtils.extractUsername(token);
            if (email == null) {
                throw new AuthenticationException("Invalid token");
            }

            if (!jwtUtils.isTokenValid(token, email)) {
                throw new AuthenticationException("Invalid or expired token");
            }

            String userId = jwtUtils.extractUserId(token);
            String role = jwtUtils.extractRole(token);

            AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                    .userId(userId)
                    .username(email)
                    .email(email)
                    .role(role)
                    .build();

            return AuthResponse.builder()
                    .accessToken(token)
                    .expiresIn(jwtUtils.getExpirationSeconds())
                    .user(userDto)
                    .build();
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token");
        }
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        // Minimal variant does not store refresh tokens.
        throw new AuthenticationException("Token refresh is handled by the external authentication provider");
    }

    public void logout(String refreshToken) {
        // No-op: minimal variant does not store refresh tokens.
    }

    public AuthResponse.UserDto getCurrentUser() {
        String email = getCurrentUserEmail();
        String userId = getCurrentUserId();
        String role = getCurrentUserRole();

        return AuthResponse.UserDto.builder()
                .userId(userId)
                .username(email)
                .email(email)
                .role(role != null ? role.replace("ROLE_", "") : null)
                .build();
    }

    public AuthResponse.UserDto getProfile() {
        return getCurrentUser();
    }

    public AuthResponse.UserDto updateProfile(UpdateProfileRequest request) {
        // In minimal variant, user profiles are managed by the external auth provider.
        // Return current user info from JWT claims.
        return getCurrentUser();
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getCurrentUserId() {
        try {
            Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();
            if (credentials instanceof String) {
                return (String) credentials;
            }
        } catch (Exception ignored) {
        }
        return getCurrentUserEmail();
    }

    private String getCurrentUserRole() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority())
                    .orElse(null);
        } catch (Exception ignored) {
        }
        return null;
    }
}
