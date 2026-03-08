package com.apptemplate.api.features.auth;

import com.apptemplate.api.common.audit.AuditLog;
import com.apptemplate.api.common.audit.AuditLogRepository;
import com.apptemplate.api.common.exception.AuthenticationException;
import com.apptemplate.api.common.security.JwtUtils;
import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuthResponse validateToken(ValidateTokenRequest request) {
        // Validate the external token (shared secret / SSO token)
        // In a real implementation, this would verify the token against an external auth provider
        try {
            String email = jwtUtils.extractUsername(request.getToken());
            if (email == null) {
                throw new AuthenticationException("Invalid token");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AuthenticationException("User not found"));

            if (!user.isActive()) {
                throw new AuthenticationException("Account is disabled");
            }

            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtUtils.generateToken(user.getEmail(), user.getId(),
                    user.getRole(), user.getDepartmentId());
            String refreshToken = createRefreshToken(user.getId());

            logAudit("login", "User", user.getId().toString(), user.getId(), user.getUsername());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtUtils.getExpirationSeconds())
                    .user(AuthResponse.UserDto.fromEntity(user))
                    .build();
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token");
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (!existingToken.isActive()) {
            refreshTokenRepository.revokeAllByUserId(existingToken.getUserId());
            throw new AuthenticationException("Invalid refresh token - possible token reuse detected");
        }

        if (existingToken.isExpired()) {
            throw new AuthenticationException("Refresh token has expired");
        }

        User user = userRepository.findById(existingToken.getUserId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Revoke old token
        existingToken.setRevokedAt(LocalDateTime.now());

        // Generate new tokens
        String accessToken = jwtUtils.generateToken(user.getEmail(), user.getId(),
                user.getRole(), user.getDepartmentId());
        String newRefreshTokenValue = createRefreshToken(user.getId());

        existingToken.setReplacedByToken(newRefreshTokenValue);
        refreshTokenRepository.save(existingToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshTokenValue)
                .expiresIn(jwtUtils.getExpirationSeconds())
                .user(AuthResponse.UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
                token.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(token);
            });
        }

        Long userId = getCurrentUserId();
        if (userId != null) {
            logAudit("logout", "User", userId.toString(), userId, getCurrentUserEmail());
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getCurrentUser() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));
        return AuthResponse.UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getProfile() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));
        return AuthResponse.UserDto.fromEntity(user);
    }

    @Transactional
    public AuthResponse.UserDto updateProfile(UpdateProfileRequest request) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        User savedUser = userRepository.save(user);
        return AuthResponse.UserDto.fromEntity(savedUser);
    }

    private String createRefreshToken(Long userId) {
        String tokenValue = UUID.randomUUID().toString().replace("-", "") +
                UUID.randomUUID().toString().replace("-", "");
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusDays(jwtUtils.getRefreshExpirationDays()))
                .build();
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private void logAudit(String action, String entityType, String entityId, Long userId, String userName) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setUserId(userId);
            auditLog.setUserName(userName);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to create audit log: {}", e.getMessage());
        }
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Long getCurrentUserId() {
        try {
            Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();
            if (credentials instanceof Long) {
                return (Long) credentials;
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
