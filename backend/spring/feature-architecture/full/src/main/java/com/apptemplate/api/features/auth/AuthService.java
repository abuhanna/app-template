package com.apptemplate.api.features.auth;

import com.apptemplate.api.common.audit.AuditLog;
import com.apptemplate.api.common.audit.AuditLogRepository;
import com.apptemplate.api.common.exception.AuthenticationException;
import com.apptemplate.api.common.exception.ConflictException;
import com.apptemplate.api.common.exception.ValidationException;
import com.apptemplate.api.common.security.JwtUtils;
import com.apptemplate.api.features.users.User;
import com.apptemplate.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("user");
        user.setActive(true);

        User savedUser = userRepository.save(user);

        String accessToken = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getId(),
                savedUser.getRole(), savedUser.getDepartmentId());
        String refreshToken = createRefreshToken(savedUser.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtils.getExpirationSeconds())
                .user(AuthResponse.UserDto.fromEntity(savedUser))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail() : request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            throw new AuthenticationException("Email or username is required");
        }

        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!user.isActive()) {
            throw new AuthenticationException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
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

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirm password do not match");
        }

        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ValidationException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return 200 to prevent email enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusHours(24));
            userRepository.save(user);
            log.info("Password reset token generated for user: {}", user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirm password do not match");
        }

        User user = userRepository.findAll().stream()
                .filter(u -> request.getToken().equals(u.getPasswordResetToken()))
                .filter(u -> u.getPasswordResetTokenExpiresAt() != null
                        && LocalDateTime.now().isBefore(u.getPasswordResetTokenExpiresAt()))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Invalid or expired reset token"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);
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
